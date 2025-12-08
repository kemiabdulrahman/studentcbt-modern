const request = require('supertest');
const { prisma, createTestUser, cleanupDatabase, getAuthHeader } = require('../utils');
const { startTestServer, stopTestServer } = require('../test-server');

describe('Authentication Endpoints', () => {
  let app;

  beforeAll(async () => {
    app = await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const email = `student-${Date.now()}@example.com`;
      await createTestUser(email, 'STUDENT');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });

    it('should not login with wrong password', async () => {
      const email = `student2-${Date.now()}@example.com`;
      await createTestUser(email, 'STUDENT');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const email = `refresh-${Date.now()}@example.com`;
      await createTestUser(email, 'STUDENT');
      
      // First login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'password123'
        });

      expect(loginRes.status).toBe(200);
      const { refreshToken } = loginRes.body.tokens;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
    });

    it('should not refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });

    it('should not refresh without token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const email = `profile-${Date.now()}@example.com`;
      const user = await createTestUser(email, 'STUDENT');

      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeader(user.id, 'STUDENT'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(email);
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with correct current password', async () => {
      const email = `changepw-${Date.now()}@example.com`;
      const user = await createTestUser(email, 'STUDENT');

      const res = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeader(user.id, 'STUDENT'))
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        });

      expect(res.status).toBe(200);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'newpassword456'
        });

      expect(loginRes.status).toBe(200);
    });

    it('should not change password with wrong current password', async () => {
      const email = `changepw2-${Date.now()}@example.com`;
      const user = await createTestUser(email, 'STUDENT');

      const res = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeader(user.id, 'STUDENT'))
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        });

      expect(res.status).toBe(400);
    });
  });
});
