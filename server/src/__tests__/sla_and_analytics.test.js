import request from 'supertest';
import app from '../index.js';
import { resetDemoData } from '../seed/seed.js';
import { slaService } from '../services/slaService.js';

describe('5. SLA Engine, Analytics & Reporting API', () => {
  let adminToken;
  let staffToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await resetDemoData();

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@apex.edu', password: 'Password@123' });
    adminToken = adminLogin.body.data.accessToken;

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'plumbing@apex.edu', password: 'Password@123' });
    staffToken = staffLogin.body.data.accessToken;
  });

  describe('SLA Engine & Overdue Detection', () => {
    it('should scan active complaints and flag overdue breaches and escalations', async () => {
      const result = await slaService.checkAndEscalateOverdueComplaints();

      expect(result).toBeDefined();
      expect(result.scannedCount).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();

      const complianceRate = await slaService.getComplianceRate();
      expect(typeof complianceRate).toBe('number');
      expect(complianceRate).toBeGreaterThanOrEqual(0);
      expect(complianceRate).toBeLessThanOrEqual(100);
    });

    it('should trigger manual SLA scan via admin endpoint', async () => {
      const res = await request(app)
        .post('/api/admin/trigger-sla-scan')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scannedCount).toBeDefined();
    });
  });

  describe('Executive Analytics Endpoints', () => {
    it('GET /api/analytics/overview returns valid metric totals and trends', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalComplaints).toBeGreaterThanOrEqual(40);
      expect(res.body.data.openComplaints).toBeDefined();
      expect(res.body.data.resolvedComplaints).toBeDefined();
      expect(res.body.data.slaComplianceRate).toBeDefined();
      expect(res.body.data.averageRating).toBeDefined();
    });

    it('GET /api/analytics/by-category returns breakdown for all 4 categories', async () => {
      const res = await request(app)
        .get('/api/analytics/by-category')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(4);
      expect(res.body.data[0]).toHaveProperty('categoryName');
      expect(res.body.data[0]).toHaveProperty('resolutionRate');
    });

    it('GET /api/analytics/by-building returns ranked building hotspots', async () => {
      const res = await request(app)
        .get('/api/analytics/by-building')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/analytics/staff-performance returns technician scorecards', async () => {
      const res = await request(app)
        .get('/api/analytics/staff-performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(4); // 4 technicians
      expect(res.body.data[0]).toHaveProperty('specialty');
      expect(res.body.data[0]).toHaveProperty('slaComplianceRate');
    });

    it('GET /api/analytics/my-performance allows technician to view personal scorecard', async () => {
      const res = await request(app)
        .get('/api/analytics/my-performance')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAssigned).toBeDefined();
      expect(res.body.data.activeTasks).toBeDefined();
    });
  });

  describe('Data Export Endpoints', () => {
    it('GET /api/export/complaints.csv generates and downloads RFC CSV file', async () => {
      const res = await request(app)
        .get('/api/export/complaints.csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('Reference Number');
      expect(res.text).toContain('Category');
      expect(res.text).toContain('Priority');
    });

    it('GET /api/export/analytics.pdf streams executive PDF document', async () => {
      const res = await request(app)
        .get('/api/export/analytics.pdf')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeDefined();
    });
  });
});
