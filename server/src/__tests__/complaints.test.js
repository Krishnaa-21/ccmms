import request from 'supertest';
import app from '../index.js';
import { resetDemoData } from '../seed/seed.js';

describe('2. Complaints API & Smart Automation', () => {
  let adminToken;
  let studentToken;
  let studentId;
  let staffToken;
  let staffId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await resetDemoData();

    // Login Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apex.edu', password: 'Password@123' });
    adminToken = adminLogin.body.data.accessToken;

    // Login Student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aarav.cse@apex.edu', password: 'Password@123' });
    studentToken = studentLogin.body.data.accessToken;
    studentId = studentLogin.body.data.user.id;

    // Login Staff (Plumbing)
    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'plumbing@apex.edu', password: 'Password@123' });
    staffToken = staffLogin.body.data.accessToken;
    staffId = staffLogin.body.data.user.id;
  });

  describe('Priority Suggestion Engine', () => {
    it('should suggest "Urgent" when hazardous keywords like "fire", "spark" appear', async () => {
      const res = await request(app)
        .post('/api/complaints/suggest-priority')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Electric spark coming from main board',
          description: 'Visible sparks and burning smell from switchboard in Lab 2',
          categoryId: 'cat_electrical'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.priority).toBe('Urgent');
      expect(res.body.data.reason).toMatch(/spark/i);
    });

    it('should suggest "High" for major service disruption like "no water"', async () => {
      const res = await request(app)
        .post('/api/complaints/suggest-priority')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'No water supply on 3rd floor',
          description: 'Taps and washrooms are completely dry for all students',
          categoryId: 'cat_plumbing'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('High');
    });

    it('should suggest "Low" for cosmetic repairs like "paint peeling"', async () => {
      const res = await request(app)
        .post('/api/complaints/suggest-priority')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Cosmetic paint flaking on corridor wall',
          description: 'White paint is chipping off near notice board',
          categoryId: 'cat_general'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('Low');
    });
  });

  describe('Complaint Submission & Smart Auto-Assignment', () => {
    it('should submit complaint and auto-assign matching technician based on specialty', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('title', 'Water leakage in Hostel Block A ground floor washroom')
        .field('description', 'Severe water dripping from flush pipe under sink 2')
        .field('categoryId', 'cat_plumbing')
        .field('subCategory', 'Leakage')
        .field('building', 'Hostel Block A')
        .field('floor', 'Ground Floor')
        .field('room', 'Washroom Ground Floor')
        .field('contactPreference', 'Phone');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referenceNumber).toMatch(/^CCM-2026-\d{4}$/);
      // Auto-assigned to plumbing staff
      expect(res.body.data.assignedTo).toBeDefined();
      expect(res.body.data.assignedTo.specialty.toLowerCase()).toBe('plumbing');
      expect(res.body.data.status).toBe('Assigned');
      expect(res.body.data.dueDate).toBeDefined();
    });
  });

  describe('Role-Based Complaint Scoping', () => {
    it('student should only see their own complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((c) => {
        expect(c.createdBy.id).toBe(studentId);
      });
    });

    it('maintenance staff should only see assigned complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((c) => {
        expect(c.assignedTo?.id).toBe(staffId);
      });
    });

    it('admin should see all complaints across campus', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(10);
    });
  });

  describe('Community Upvoting ("Me Too")', () => {
    it('should allow user to upvote an active complaint and increment count', async () => {
      // Find an open complaint
      const listRes = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${adminToken}`);

      const openComplaint = listRes.body.data.find(
        (c) => ['Submitted', 'Assigned', 'In Progress'].includes(c.status)
      );

      const initialCount = openComplaint.upvotesCount || 0;

      const upvoteRes = await request(app)
        .post(`/api/complaints/${openComplaint.id}/upvote`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(upvoteRes.status).toBe(200);
      expect(upvoteRes.body.success).toBe(true);
      expect(upvoteRes.body.data.upvotesCount).toBe(initialCount + 1);
    });

    it('should reject duplicate upvotes from the same user', async () => {
      const listRes = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${adminToken}`);

      const openComplaint = listRes.body.data.find(
        (c) => c.upvotedBy?.includes(studentId)
      );

      if (openComplaint) {
        const dupRes = await request(app)
          .post(`/api/complaints/${openComplaint.id}/upvote`)
          .set('Authorization', `Bearer ${studentToken}`);

        expect(dupRes.status).toBe(400);
        expect(dupRes.body.success).toBe(false);
        expect(dupRes.body.message).toMatch(/already upvoted/i);
      }
    });
  });
});

