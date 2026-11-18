import request from 'supertest';
import app from '../index.js';
import { resetDemoData } from '../seed/seed.js';

describe('3. Workflow Engine & State Transitions', () => {
  let adminToken;
  let studentToken;
  let staffToken;
  let staffId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await resetDemoData();

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apex.edu', password: 'Password@123' });
    adminToken = adminLogin.body.data.accessToken;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aarav.cse@apex.edu', password: 'Password@123' });
    studentToken = studentLogin.body.data.accessToken;

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'electrical@apex.edu', password: 'Password@123' });
    staffToken = staffLogin.body.data.accessToken;
    staffId = staffLogin.body.data.user.id;
  });

  it('should allow maintenance staff to advance Assigned -> In Progress', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100')
      .set('Authorization', `Bearer ${staffToken}`);

    const assignedTicket = listRes.body.data.find((c) => c.status === 'Assigned');
    expect(assignedTicket).toBeDefined();

    const res = await request(app)
      .patch(`/api/complaints/${assignedTicket.id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'In Progress',
        notes: 'Arrived at site with multimeter and replacement components'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('In Progress');
  });

  it('should reject resolving without mandatory resolution notes', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100')
      .set('Authorization', `Bearer ${staffToken}`);

    const inProgressTicket = listRes.body.data.find((c) => c.status === 'In Progress');
    expect(inProgressTicket).toBeDefined();

    const res = await request(app)
      .patch(`/api/complaints/${inProgressTicket.id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'Resolved'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/resolution notes/i);
  });

  it('should allow maintenance staff to resolve with resolution notes', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100')
      .set('Authorization', `Bearer ${staffToken}`);

    const inProgressTicket = listRes.body.data.find((c) => c.status === 'In Progress');
    expect(inProgressTicket).toBeDefined();

    const res = await request(app)
      .patch(`/api/complaints/${inProgressTicket.id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'Resolved',
        resolutionNotes: 'Replaced defective unit and tested under load for 30 mins.',
        costIncurred: 250,
        partsReplaced: 'Capacitor and fuse'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Resolved');
    expect(res.body.data.resolvedAt).toBeDefined();
  });

  it('should forbid student from executing technician transition (Assigned -> In Progress)', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100')
      .set('Authorization', `Bearer ${adminToken}`);

    const assignedTicket = listRes.body.data.find((c) => c.status === 'Assigned');
    expect(assignedTicket).toBeDefined();

    const res = await request(app)
      .patch(`/api/complaints/${assignedTicket.id}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        status: 'In Progress'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow student to reopen a resolved complaint with reason', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100&status=Resolved')
      .set('Authorization', `Bearer ${adminToken}`);

    const resolvedTicket = listRes.body.data.find((c) => c.status === 'Resolved');
    expect(resolvedTicket).toBeDefined();

    const reopenRes = await request(app)
      .post(`/api/complaints/${resolvedTicket.id}/reopen`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Issue recurred after evening load increase'
      });

    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.success).toBe(true);
    expect(reopenRes.body.data.status).toBe('Reopened');
  });

  it('should allow admin to close a resolved complaint', async () => {
    const listRes = await request(app)
      .get('/api/complaints?limit=100&status=Resolved')
      .set('Authorization', `Bearer ${adminToken}`);

    const resolvedTicket = listRes.body.data.find((c) => c.status === 'Resolved');
    expect(resolvedTicket).toBeDefined();

    const closeRes = await request(app)
      .post(`/api/complaints/${resolvedTicket.id}/close`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        notes: 'Verified by facilities supervisor during inspection rounds'
      });

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.success).toBe(true);
    expect(closeRes.body.data.status).toBe('Closed');
    expect(closeRes.body.data.closedAt).toBeDefined();
  });
});
