const request = require('supertest');
const { 
  prisma, 
  createTestUser, 
  createTestStudent,
  createTestClass,
  createTestSubject,
  createTestAssessment,
  createTestQuestion,
  cleanupDatabase, 
  getAuthHeader 
} = require('../utils');
const { startTestServer, stopTestServer } = require('../test-server');

describe('Assessment Endpoints', () => {
  let app;
  let adminUser, studentUser, testClass, testSubject, testAssessment;

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

    // Create admin user
    adminUser = await createTestUser(`admin-${Date.now()}-${Math.random()}@example.com`, 'ADMIN');
    
    // Create student user and profile
    studentUser = await createTestUser(`student-${Date.now()}-${Math.random()}@example.com`, 'STUDENT');
    testClass = await createTestClass(`JSS${Date.now()}-${Math.random()}`, 'Science');
    await createTestStudent(testClass.id, studentUser.id, `STU${Date.now()}-${Math.random()}`);
    
    // Create subject and assessment
    testSubject = await createTestSubject(`Subject-${Date.now()}-${Math.random()}`);
    testAssessment = await createTestAssessment(testClass.id, testSubject.id, {
      title: 'Math Quiz',
      totalMarks: 100
    });

    // Create questions
    await createTestQuestion(testAssessment.id, {
      questionText: 'What is 2 + 2?',
      correctAnswer: '4',
      orderIndex: 1
    });
  });

  describe('GET /api/assessment/:id', () => {
    it('should fetch assessment details', async () => {
      const res = await request(app)
        .get(`/api/assessment/${testAssessment.id}`)
        .set(getAuthHeader(adminUser.id, 'ADMIN'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('assessment');
      expect(res.body.assessment.id).toBe(testAssessment.id);
    });

    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app)
        .get('/api/assessment/non-existent-id')
        .set(getAuthHeader(adminUser.id, 'ADMIN'));

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/assessment/:id/results', () => {
    it('should fetch assessment results (admin only)', async () => {
      const res = await request(app)
        .get(`/api/assessment/${testAssessment.id}/results?page=1&limit=10`)
        .set(getAuthHeader(adminUser.id, 'ADMIN'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('statistics');
    });

    it('should not allow student to fetch results', async () => {
      const res = await request(app)
        .get(`/api/assessment/${testAssessment.id}/results`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/assessment', () => {
    it('should create a new assessment (admin only)', async () => {
      const res = await request(app)
        .post('/api/assessment')
        .set(getAuthHeader(adminUser.id, 'ADMIN'))
        .send({
          title: 'New Quiz',
          description: 'Test description',
          classId: testClass.id,
          subjectId: testSubject.id,
          duration: 30,
          totalMarks: 50,
          passMarks: 25
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('assessment');
      expect(res.body.assessment.title).toBe('New Quiz');
    });

    it('should not allow student to create assessment', async () => {
      const res = await request(app)
        .post('/api/assessment')
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          title: 'Student Quiz',
          classId: testClass.id,
          subjectId: testSubject.id
        });

      expect(res.status).toBe(403);
    });
  });
});
