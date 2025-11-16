import { Hono } from "hono";
import type { Env } from './core-utils';
import { KeyEntity, KeyAssignmentEntity, NotificationEntity, UserProfileEntity, KeyRequestEntity, UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Key, ReportSummary, KeyStatus, OverdueKeyInfo, Notification, UserProfile, KeyRequest, User } from "@shared/types";
async function checkAndUpdateOverdueKeys(env: Env) {
  const assignments = await KeyAssignmentEntity.list(env);
  const activeAssignments = assignments.items.filter(a => !a.returnDate);
  for (const assignment of activeAssignments) {
    // Only event assignments with a due date can be overdue.
    if (assignment.assignmentType === 'event' && assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      const key = new KeyEntity(env, assignment.keyId);
      if (await key.exists()) {
        const keyState = await key.getState();
        if (keyState.status === 'Issued') {
          await key.patch({ status: 'Overdue' });
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            message: `Key "${keyState.keyNumber}" is now overdue.`,
            timestamp: new Date().toISOString(),
            read: false,
          };
          await NotificationEntity.create(env, newNotification);
        }
      }
    }
  }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Seed default admin user
  app.use('*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await next();
  });
  // --- AUTH ---
  app.post('/api/auth/signup', async (c) => {
    const body = await c.req.json<Partial<User>>();
    if (!isStr(body.name) || !isStr(body.email) || !isStr(body.password)) {
      return bad(c, 'Name, email, and password are required');
    }
    const allUsers = (await UserEntity.list(c.env)).items;
    const existingUser = allUsers.find(u => u.email === body.email);
    if (existingUser) {
      return bad(c, 'An account with this email already exists.');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      password: body.password, // In a real app, hash this password
      department: body.department || 'Unassigned',
      phone: body.phone || '',
      role: 'user',
    };
    const createdUser = await UserEntity.create(c.env, newUser);
    const { password, ...userResponse } = createdUser;
    return ok(c, userResponse);
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required');
    }
    const allUsers = (await UserEntity.list(c.env)).items;
    const user = allUsers.find(u => u.email === email);
    if (!user || user.password !== password) { // In a real app, compare hashed passwords
      return bad(c, 'Invalid credentials');
    }
    const { password: _, ...userResponse } = user;
    return ok(c, userResponse);
  });
  // --- DASHBOARD ---
  app.get('/api/stats', async (c) => {
    await checkAndUpdateOverdueKeys(c.env);
    const allKeys = await KeyEntity.list(c.env);
    const totalKeys = allKeys.items.length;
    const keysIssued = allKeys.items.filter(k => k.status === 'Issued' || k.status === 'Overdue').length;
    const overdueKeys = allKeys.items.filter(k => k.status === 'Overdue').length;
    return ok(c, {
      totalKeys,
      keysIssued,
      keysAvailable: totalKeys - keysIssued,
      overdueKeys,
    });
  });
  app.get('/api/assignments/recent', async (c) => {
    const assignmentsPage = await KeyAssignmentEntity.list(c.env);
    const assignments = assignmentsPage.items.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        const user = await new UserEntity(c.env, assignment.personnelId).getState();
        return { ...assignment, key, user };
      })
    );
    return ok(c, populatedAssignments);
  });
  // --- REPORTS ---
  app.get('/api/reports/summary', async (c) => {
    await checkAndUpdateOverdueKeys(c.env);
    const allKeys = (await KeyEntity.list(c.env)).items;
    const allUsers = (await UserEntity.list(c.env)).items;
    const allAssignments = (await KeyAssignmentEntity.list(c.env)).items;
    const userMap = new Map(allUsers.map(p => [p.id, p]));
    // 1. Status Distribution
    const statusCounts: Record<KeyStatus, number> = { Available: 0, Issued: 0, Overdue: 0, Lost: 0 };
    allKeys.forEach(key => { statusCounts[key.status]++; });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name: name as KeyStatus, value }));
    // 2. Department Activity
    const departmentCounts: Record<string, number> = {};
    const activeAssignments = allAssignments.filter(a => !a.returnDate);
    activeAssignments.forEach(assignment => {
      const user = userMap.get(assignment.personnelId);
      if (user) {
        departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;
      }
    });
    const departmentActivity = Object.entries(departmentCounts).map(([name, keys]) => ({ name, keys }));
    // 3. Overdue Keys
    const overdueKeysPromises = allKeys
      .filter(k => k.status === 'Overdue')
      .map(async (key): Promise<OverdueKeyInfo | null> => {
        const assignment = allAssignments.find(a => a.keyId === key.id && !a.returnDate);
        if (assignment && assignment.dueDate) {
          const user = userMap.get(assignment.personnelId);
          return {
            keyNumber: key.keyNumber,
            roomNumber: key.roomNumber,
            userName: user?.name || 'Unknown',
            department: user?.department || 'Unknown',
            dueDate: assignment.dueDate,
          };
        }
        return null;
      });
    const overdueKeysResults = await Promise.all(overdueKeysPromises);
    const summary: ReportSummary = {
      statusDistribution,
      departmentActivity,
      overdueKeys: overdueKeysResults.filter((k): k is OverdueKeyInfo => k !== null),
    };
    return ok(c, summary);
  });
  // --- SETTINGS ---
  app.post('/api/settings/reset', async (c) => {
    const allKeys = await KeyEntity.list(c.env);
    const allUsers = await UserEntity.list(c.env);
    const allAssignments = await KeyAssignmentEntity.list(c.env);
    const allNotifications = await NotificationEntity.list(c.env);
    await KeyEntity.deleteMany(c.env, allKeys.items.map(k => k.id));
    // Keep seed users, delete others
    const seedUserIds = UserEntity.seedData.map(u => u.id);
    const usersToDelete = allUsers.items.filter(u => !seedUserIds.includes(u.id));
    await UserEntity.deleteMany(c.env, usersToDelete.map(p => p.id));
    await KeyAssignmentEntity.deleteMany(c.env, allAssignments.items.map(a => a.id));
    await NotificationEntity.deleteMany(c.env, allNotifications.items.map(n => n.id));
    // Also reset profile logo
    const profile = new UserProfileEntity(c.env, 'main');
    if (await profile.exists()) {
      await profile.patch({ appLogoBase64: null });
    }
    return ok(c, { message: 'All data cleared successfully.' });
  });
  app.put('/api/settings/logo', async (c) => {
    const body = await c.req.json<{ logo: string | null }>();
    const profile = new UserProfileEntity(c.env, 'main');
    if (!(await profile.exists())) {
      return notFound(c, 'Profile not found');
    }
    await profile.patch({ appLogoBase64: body.logo });
    return ok(c, await profile.getState());
  });
  // --- NOTIFICATIONS ---
  app.get('/api/notifications', async (c) => {
    const notificationsPage = await NotificationEntity.list(c.env, null, 100); // Fetch a larger number to sort
    const sorted = notificationsPage.items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Return the 10 most recent
    return ok(c, sorted);
  });
  app.post('/api/notifications/mark-read', async (c) => {
    const { ids } = await c.req.json<{ ids: string[] }>();
    if (!ids || !Array.isArray(ids)) return bad(c, 'Invalid payload');
    for (const id of ids) {
      const notification = new NotificationEntity(c.env, id);
      if (await notification.exists()) {
        await notification.patch({ read: true });
      }
    }
    return ok(c, { success: true });
  });
  // --- USER PROFILE ---
  app.get('/api/profile', async (c) => {
    const profile = new UserProfileEntity(c.env, 'main');
    if (!(await profile.exists())) {
      // Create a default profile if it doesn't exist
      await profile.save(UserProfileEntity.initialState);
    }
    return ok(c, await profile.getState());
  });
  app.put('/api/profile', async (c) => {
    const body = await c.req.json<Partial<UserProfile>>();
    const profile = new UserProfileEntity(c.env, 'main');
    if (!(await profile.exists())) {
      return notFound(c, 'Profile not found');
    }
    await profile.patch({
      name: body.name,
      email: body.email,
      department: body.department,
    });
    return ok(c, await profile.getState());
  });
  // --- KEYS ---
  app.get('/api/keys', async (c) => {
    await checkAndUpdateOverdueKeys(c.env);
    return ok(c, await KeyEntity.list(c.env));
  });
  app.post('/api/keys', async (c) => {
    const body = await c.req.json<Partial<Key>>();
    if (!isStr(body.keyNumber) || !isStr(body.roomNumber)) return bad(c, 'keyNumber and roomNumber are required');
    const newKey: Key = {
      id: crypto.randomUUID(),
      keyNumber: body.keyNumber,
      keyType: body.keyType || 'Single',
      roomNumber: body.roomNumber,
      status: 'Available',
    };
    return ok(c, await KeyEntity.create(c.env, newKey));
  });
  app.put('/api/keys/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Key>>();
    const key = new KeyEntity(c.env, id);
    if (!(await key.exists())) return notFound(c, 'Key not found');
    await key.patch({
      keyNumber: body.keyNumber,
      keyType: body.keyType,
      roomNumber: body.roomNumber,
    });
    return ok(c, await key.getState());
  });
  app.delete('/api/keys/:id', async (c) => {
    const id = c.req.param('id');
    const existed = await KeyEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'Key not found');
    return ok(c, { id });
  });
  app.post('/api/keys/:id/return', async (c) => {
    const keyId = c.req.param('id');
    const key = new KeyEntity(c.env, keyId);
    if (!(await key.exists())) return notFound(c, 'Key not found');
    const keyState = await key.getState();
    const assignments = await KeyAssignmentEntity.list(c.env);
    const assignment = assignments.items.find(a => a.keyId === keyId && !a.returnDate);
    if (!assignment) return bad(c, 'Key is not currently assigned');
    const assignmentEntity = new KeyAssignmentEntity(c.env, assignment.id);
    await assignmentEntity.patch({ returnDate: new Date().toISOString() });
    await key.patch({ status: 'Available' });
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `Key "${keyState.keyNumber}" was returned.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, await key.getState());
  });
  app.post('/api/keys/:id/lost', async (c) => {
    const keyId = c.req.param('id');
    const key = new KeyEntity(c.env, keyId);
    if (!(await key.exists())) return notFound(c, 'Key not found');
    const keyState = await key.getState();
    await key.patch({ status: 'Lost' });
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `Key "${keyState.keyNumber}" was reported lost.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, await key.getState());
  });
  app.get('/api/keys/:id/history', async (c) => {
    const keyId = c.req.param('id');
    const allAssignments = await KeyAssignmentEntity.list(c.env);
    const keyAssignments = allAssignments.items.filter(a => a.keyId === keyId);
    const populated = await Promise.all(
      keyAssignments.map(async (assignment) => {
        const user = await new UserEntity(c.env, assignment.personnelId).getState();
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        return { ...assignment, user, key };
      })
    );
    return ok(c, populated.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
  });
  // --- USERS ---
  app.get('/api/users', async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', async (c) => {
    const body = await c.req.json<Partial<User>>();
    if (!isStr(body.name) || !isStr(body.department) || !isStr(body.email)) return bad(c, 'name, department, and email are required');
    const newUser: User = {
      id: crypto.randomUUID(),
      name: body.name,
      department: body.department,
      email: body.email,
      phone: body.phone || '',
      role: body.role || 'user',
    };
    return ok(c, await UserEntity.create(c.env, newUser));
  });
  app.put('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<User>>();
    const user = new UserEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    await user.patch({
      name: body.name,
      department: body.department,
      email: body.email,
      phone: body.phone,
      role: body.role,
    });
    return ok(c, await user.getState());
  });
  app.delete('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const existed = await UserEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'User not found');
    return ok(c, { id });
  });
  app.get('/api/users/:id/keys', async (c) => {
    const userId = c.req.param('id');
    const allAssignments = await KeyAssignmentEntity.list(c.env);
    const userAssignments = allAssignments.items.filter(a => a.personnelId === userId);
    const populated = await Promise.all(
      userAssignments.map(async (assignment) => {
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        const user = await new UserEntity(c.env, assignment.personnelId).getState();
        return { ...assignment, key, user };
      })
    );
    return ok(c, populated);
  });
  // --- ASSIGNMENTS ---
  app.post('/api/assignments', async (c) => {
    const body = await c.req.json<Partial<KeyAssignment>>();
    if (!isStr(body.keyId) || !isStr(body.personnelId)) {
      return bad(c, 'keyId and personnelId are required');
    }
    const assignmentType = body.assignmentType || 'event';
    if (assignmentType === 'event' && !isStr(body.dueDate)) {
      return bad(c, 'dueDate is required for event assignments');
    }
    const key = new KeyEntity(c.env, body.keyId);
    if (!(await key.exists()) || (await key.getState()).status !== 'Available') {
      return bad(c, 'Key is not available for assignment');
    }
    const keyState = await key.getState();
    const user = await new UserEntity(c.env, body.personnelId).getState();
    const newAssignment: KeyAssignment = {
      id: crypto.randomUUID(),
      keyId: body.keyId,
      personnelId: body.personnelId,
      issueDate: body.issueDate || new Date().toISOString(),
      assignmentType: assignmentType,
      dueDate: body.dueDate,
    };
    await key.patch({ status: 'Issued' });
    const createdAssignment = await KeyAssignmentEntity.create(c.env, newAssignment);
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `Key "${keyState.keyNumber}" issued to ${user.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, createdAssignment);
  });
  // --- KEY REQUESTS ---
  app.get('/api/requests', async (c) => {
    const requestsPage = await KeyRequestEntity.list(c.env);
    const requests = requestsPage.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        const user = await new UserEntity(c.env, request.personnelId).getState();
        return { ...request, user };
      })
    );
    return ok(c, populatedRequests);
  });
  app.post('/api/requests', async (c) => {
    const body = await c.req.json<Partial<KeyRequest>>();
    if (!isStr(body.personnelId) || !isStr(body.requestedKeyInfo) || !isStr(body.issueDate)) {
      return bad(c, 'personnelId, requestedKeyInfo, and issueDate are required');
    }
    const assignmentType = body.assignmentType || 'event';
    if (assignmentType === 'event' && !isStr(body.dueDate)) {
      return bad(c, 'dueDate is required for event requests');
    }
    const newRequest: KeyRequest = {
      id: crypto.randomUUID(),
      personnelId: body.personnelId,
      requestedKeyInfo: body.requestedKeyInfo,
      assignmentType: assignmentType,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    const createdRequest = await KeyRequestEntity.create(c.env, newRequest);
    const user = await new UserEntity(c.env, body.personnelId).getState();
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `New key request submitted by ${user.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, createdRequest);
  });
  app.post('/api/requests/:id/approve', async (c) => {
    const requestId = c.req.param('id');
    const { keyId } = await c.req.json<{ keyId: string }>();
    if (!isStr(keyId)) return bad(c, 'keyId is required');
    const requestEntity = new KeyRequestEntity(c.env, requestId);
    if (!(await requestEntity.exists())) return notFound(c, 'Request not found');
    const request = await requestEntity.getState();
    if (request.status !== 'Pending') return bad(c, 'Request is not pending');
    const keyEntity = new KeyEntity(c.env, keyId);
    if (!(await keyEntity.exists())) return notFound(c, 'Selected key not found');
    const key = await keyEntity.getState();
    if (key.status !== 'Available') return bad(c, 'Selected key is not available');
    // Create assignment
    const newAssignment: KeyAssignment = {
      id: crypto.randomUUID(),
      keyId: key.id,
      personnelId: request.personnelId,
      issueDate: request.issueDate,
      assignmentType: request.assignmentType,
      dueDate: request.dueDate,
    };
    await KeyAssignmentEntity.create(c.env, newAssignment);
    // Update key status
    await keyEntity.patch({ status: 'Issued' });
    // Update request status
    await requestEntity.patch({ status: 'Approved' });
    // Create notification
    const user = await new UserEntity(c.env, request.personnelId).getState();
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `Key request for ${user.name} was approved. Key "${key.keyNumber}" issued.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, await requestEntity.getState());
  });
  app.post('/api/requests/:id/reject', async (c) => {
    const requestId = c.req.param('id');
    const requestEntity = new KeyRequestEntity(c.env, requestId);
    if (!(await requestEntity.exists())) return notFound(c, 'Request not found');
    const request = await requestEntity.getState();
    if (request.status !== 'Pending') return bad(c, 'Request is not pending');
    await requestEntity.patch({ status: 'Rejected' });
    const user = await new UserEntity(c.env, request.personnelId).getState();
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message: `Key request for ${user.name} was rejected.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, await requestEntity.getState());
  });
}