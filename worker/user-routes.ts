import { Hono } from "hono";
import type { Env } from './core-utils';
import { KeyEntity, PersonnelEntity, KeyAssignmentEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Key, Personnel, KeyAssignment } from "@shared/types";
import { isAfter } from 'date-fns';
async function checkAndUpdateOverdueKeys(env: Env) {
  const assignments = await KeyAssignmentEntity.list(env);
  const activeAssignments = assignments.items.filter(a => !a.returnDate);
  for (const assignment of activeAssignments) {
    if (isAfter(new Date(), new Date(assignment.dueDate))) {
      const key = new KeyEntity(env, assignment.keyId);
      if (await key.exists()) {
        const keyState = await key.getState();
        if (keyState.status === 'Issued') {
          await key.patch({ status: 'Overdue' });
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
    const assignmentsPage = await KeyAssignmentEntity.list(c.env, null, 5);
    const assignments = assignmentsPage.items.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const key = await new KeyEntity(c.env, assignment.keyId).getState();
        const personnel = await new PersonnelEntity(c.env, assignment.personnelId).getState();
        return { ...assignment, key, personnel };
      })
    );
    return ok(c, populatedAssignments);
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
    const assignments = await KeyAssignmentEntity.list(c.env);
    const assignment = assignments.items.find(a => a.keyId === keyId && !a.returnDate);
    if (!assignment) return bad(c, 'Key is not currently assigned');
    const assignmentEntity = new KeyAssignmentEntity(c.env, assignment.id);
    await assignmentEntity.patch({ returnDate: new Date().toISOString() });
    await key.patch({ status: 'Available' });
    return ok(c, await key.getState());
  });
  app.post('/api/keys/:id/lost', async (c) => {
    const keyId = c.req.param('id');
    const key = new KeyEntity(c.env, keyId);
    if (!(await key.exists())) return notFound(c, 'Key not found');
    await key.patch({ status: 'Lost' });
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
    if (!isStr(body.keyId) || !isStr(body.personnelId) || !isStr(body.dueDate)) {
      return bad(c, 'keyId, personnelId, and dueDate are required');
    }
    const key = new KeyEntity(c.env, body.keyId);
    if (!(await key.exists()) || (await key.getState()).status !== 'Available') {
      return bad(c, 'Key is not available for assignment');
    }
    const newAssignment: KeyAssignment = {
      id: crypto.randomUUID(),
      keyId: body.keyId,
      personnelId: body.personnelId,
      issueDate: new Date().toISOString(),
      dueDate: body.dueDate,
    };
    await key.patch({ status: 'Issued' });
    return ok(c, await KeyAssignmentEntity.create(c.env, newAssignment));
  });
}