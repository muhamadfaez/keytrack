import { Hono } from "hono";
import type { Env } from './core-utils';
import { KeyEntity, PersonnelEntity, KeyAssignmentEntity, NotificationEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Key, Personnel, KeyAssignment, ReportSummary, KeyStatus, OverdueKeyInfo, Notification } from "@shared/types";
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
        const personnel = await new PersonnelEntity(c.env, assignment.personnelId).getState();
        return { ...assignment, key, personnel };
      })
    );
    return ok(c, populatedAssignments);
  });
  // --- REPORTS ---
  app.get('/api/reports/summary', async (c) => {
    await checkAndUpdateOverdueKeys(c.env);
    const allKeys = (await KeyEntity.list(c.env)).items;
    const allPersonnel = (await PersonnelEntity.list(c.env)).items;
    const allAssignments = (await KeyAssignmentEntity.list(c.env)).items;
    const personnelMap = new Map(allPersonnel.map(p => [p.id, p]));
    // 1. Status Distribution
    const statusCounts: Record<KeyStatus, number> = { Available: 0, Issued: 0, Overdue: 0, Lost: 0 };
    allKeys.forEach(key => { statusCounts[key.status]++; });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name: name as KeyStatus, value }));
    // 2. Department Activity
    const departmentCounts: Record<string, number> = {};
    const activeAssignments = allAssignments.filter(a => !a.returnDate);
    activeAssignments.forEach(assignment => {
      const person = personnelMap.get(assignment.personnelId);
      if (person) {
        departmentCounts[person.department] = (departmentCounts[person.department] || 0) + 1;
      }
    });
    const departmentActivity = Object.entries(departmentCounts).map(([name, keys]) => ({ name, keys }));
    // 3. Overdue Keys
    const overdueKeysPromises = allKeys
      .filter(k => k.status === 'Overdue')
      .map(async (key): Promise<OverdueKeyInfo | null> => {
        const assignment = allAssignments.find(a => a.keyId === key.id && !a.returnDate);
        if (assignment && assignment.dueDate) {
          const person = personnelMap.get(assignment.personnelId);
          return {
            keyNumber: key.keyNumber,
            roomNumber: key.roomNumber,
            personName: person?.name || 'Unknown',
            department: person?.department || 'Unknown',
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
    const allPersonnel = await PersonnelEntity.list(c.env);
    const allAssignments = await KeyAssignmentEntity.list(c.env);
    const allNotifications = await NotificationEntity.list(c.env);
    await KeyEntity.deleteMany(c.env, allKeys.items.map(k => k.id));
    await PersonnelEntity.deleteMany(c.env, allPersonnel.items.map(p => p.id));
    await KeyAssignmentEntity.deleteMany(c.env, allAssignments.items.map(a => a.id));
    await NotificationEntity.deleteMany(c.env, allNotifications.items.map(n => n.id));
    return ok(c, { message: 'All data cleared successfully.' });
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
        const personnel = await new PersonnelEntity(c.env, assignment.personnelId).getState();
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        return { ...assignment, personnel, key };
      })
    );
    return ok(c, populated.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
  });
  // --- PERSONNEL ---
  app.get('/api/personnel', async (c) => ok(c, await PersonnelEntity.list(c.env)));
  app.post('/api/personnel', async (c) => {
    const body = await c.req.json<Partial<Personnel>>();
    if (!isStr(body.name) || !isStr(body.department) || !isStr(body.email)) return bad(c, 'name, department, and email are required');
    const newPerson: Personnel = {
      id: crypto.randomUUID(),
      name: body.name,
      department: body.department,
      email: body.email,
      phone: body.phone || '',
    };
    return ok(c, await PersonnelEntity.create(c.env, newPerson));
  });
  app.put('/api/personnel/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Personnel>>();
    const person = new PersonnelEntity(c.env, id);
    if (!(await person.exists())) return notFound(c, 'Personnel not found');
    await person.patch({
      name: body.name,
      department: body.department,
      email: body.email,
      phone: body.phone,
    });
    return ok(c, await person.getState());
  });
  app.delete('/api/personnel/:id', async (c) => {
    const id = c.req.param('id');
    const existed = await PersonnelEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'Personnel not found');
    return ok(c, { id });
  });
  app.get('/api/personnel/:id/keys', async (c) => {
    const personnelId = c.req.param('id');
    const allAssignments = await KeyAssignmentEntity.list(c.env);
    const personAssignments = allAssignments.items.filter(a => a.personnelId === personnelId);
    const populated = await Promise.all(
      personAssignments.map(async (assignment) => {
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        const personnel = await new PersonnelEntity(c.env, assignment.personnelId).getState();
        return { ...assignment, key, personnel };
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
    const person = await new PersonnelEntity(c.env, body.personnelId).getState();
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
      message: `Key "${keyState.keyNumber}" issued to ${person.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    await NotificationEntity.create(c.env, newNotification);
    return ok(c, createdAssignment);
  });
}