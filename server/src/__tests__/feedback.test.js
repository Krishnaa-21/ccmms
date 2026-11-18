import request from 'supertest';
import app from '../index.js';
import { resetDemoData } from '../seed/seed.js';

describe('4. Feedback & Rating Rules', () => {
  let adminToken;
  let studentToken;
  let otherStudentToken;

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

    const otherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.ece@apex.edu', password: 'Password@123' });
    otherStudentToken = otherLogin.body.data.accessToken;
  });

  it('should reject feedback submission on active / unresolved complaint', async () => {
    // Find an In Progress complaint created by Aarav
    const listRes = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`);

    const activeComplaint = listRes.body.data.find(
      (c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)
    );

    if (activeComplaint) {
      const res = await request(app)
        .post(`/api/complaints/${activeComplaint.id}/feedback`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          comment: 'Premature review before completion'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Resolved or Closed/i);
    }
  });

  it('should reject feedback if submitted by a user who is not the requester', async () => {
    const listRes = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${adminToken}`);

    // Aarav's resolved complaint
    const aaravResolved = listRes.body.data.find(
      (c) => c.status === 'Resolved' && c.createdBy.email === 'aarav.cse@apex.edu'
    );

    if (aaravResolved) {
      // Priya attempts to submit feedback for Aarav's ticket
      const res = await request(app)
        .post(`/api/complaints/${aaravResolved.id}/feedback`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({
          rating: 4,
          comment: 'Trying to rate someone else ticket'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Only the complaint requester/i);
    }
  });

  it('should allow the requester to submit valid 1-5 feedback on resolved ticket', async () => {
    // Submit new ticket, resolve it, then submit feedback
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('title', 'Water cooler tap loose in hostel')
      .field('description', 'Water leaking on floor')
      .field('categoryId', 'cat_plumbing')
      .field('subCategory', 'Tap/Flush repair')
      .field('building', 'Hostel Block A')
      .field('floor', '1st Floor')
      .field('room', 'Water Cooler Bay');

    const complaintId = createRes.body.data.id;

    // Transition Assigned -> In Progress -> Resolved
    await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'In Progress',
        notes: 'Technician on site'
      });

    // Resolve as admin
    await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Resolved',
        resolutionNotes: 'Tightened compression coupling and tested.'
      });

    // Now submit feedback as student
    const fbRes = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 5,
        comment: 'Fixed promptly! Works great now.',
        timelinessRating: 5,
        cleanlinessRating: 5
      });

    expect(fbRes.status).toBe(201);
    expect(fbRes.body.success).toBe(true);
    expect(fbRes.body.data.rating).toBe(5);

    // Try submitting duplicate feedback on same ticket
    const dupRes = await request(app)
      .post(`/api/complaints/${complaintId}/feedback`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 4,
        comment: 'Second feedback attempt'
      });

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.success).toBe(false);
    expect(dupRes.body.message).toMatch(/already been submitted/i);
  });
});
