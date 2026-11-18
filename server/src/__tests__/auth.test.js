import request from 'supertest';
import app from '../index.js';
import { resetDemoData } from '../seed/seed.js';

describe('1. Authentication & Security API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await resetDemoData();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new student account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Karan Sharma',
          email: 'karan.sharma@apex.edu',
          password: 'Password@123',
          phone: '+91 98765 99999',
          department: 'Computer Science (B.Tech 1st Yr)'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('karan.sharma@apex.edu');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject registration if email is already taken', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Karan',
          email: 'karan.sharma@apex.edu',
          password: 'Password@123',
          department: 'Computer Science'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'not-an-email',
          password: '123',
          department: 'CS'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid demo credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@apex.edu',
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@apex.edu',
          password: 'WrongPassword456'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return profile when valid token is supplied', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@apex.edu', password: 'Password@123' });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@apex.edu');
    });
  });
});

