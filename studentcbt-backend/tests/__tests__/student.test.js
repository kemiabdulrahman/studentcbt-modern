const request = require('supertest');
const { 
  prisma, 
  createTestUser, 
  createTestStudent,
  createTestClass,
  createTestSubject,
  createTestAssessment,
  createTestQuestion,
  createTestAttempt,
  cleanupDatabase, 
  getAuthHeader 
} = require('../utils');
const { startTestServer, stopTestServer } = require('../test-server');

describe('Student Endpoints', () => {
  let app;
  let studentUser, studentProfile, testClass, testSubject, testAssessment, testQuestion;

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

    // Create student user and profile
    studentUser = await createTestUser(`student-${Date.now()}-${Math.random()}@example.com`, 'STUDENT');
    testClass = await createTestClass(`Class-${Date.now()}-${Math.random()}`, 'Science');
    studentProfile = await createTestStudent(testClass.id, studentUser.id, `STU${Date.now()}-${Math.random()}`);

    // Create subject and assessment
    testSubject = await createTestSubject(`Subject-${Date.now()}-${Math.random()}`);
    testAssessment = await createTestAssessment(testClass.id, testSubject.id, {
      title: 'Math Quiz',
      totalMarks: 100,
      showResults: true
    });

    // Create questions
    testQuestion = await createTestQuestion(testAssessment.id, {
      questionText: 'What is 2 + 2?',
      correctAnswer: '4',
      marks: 10,
      orderIndex: 1
    });
  });

  describe('GET /api/student/assessments', () => {
    it('should fetch available assessments for student', async () => {
      const res = await request(app)
        .get('/api/student/assessments')
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('assessments');
    });
  });

  describe('POST /api/student/assessments/:id/start', () => {
    it('should start an assessment attempt', async () => {
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('attempt');
    });

    it('should not allow duplicate attempts', async () => {
      // Create first attempt
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      // Try to create duplicate
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/student/assessments/:assessmentId/answer', () => {
    it('should submit an answer', async () => {
      // First start an attempt
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: testQuestion.id,
          answer: '4'
        });

      expect([200, 201]).toContain(res.status);
    });

    it('should validate question exists', async () => {
      // First start an attempt
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: 'non-existent',
          answer: '4'
        });

      // Could be 400 (bad request) or 404 (not found)
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('POST /api/student/assessments/:assessmentId/submit', () => {
    it('should submit assessment', async () => {
      // Start an attempt first
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      // Submit an answer
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: testQuestion.id,
          answer: '4'
        });

      // Submit the assessment
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/submit`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('GET /api/student/results/:assessmentId', () => {
    it('should fetch detailed result', async () => {
      // Start, answer, and submit an attempt first
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: testQuestion.id,
          answer: '4'
        });

      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/submit`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      const res = await request(app)
        .get(`/api/student/results/${testAssessment.id}`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('assessment');
      expect(res.body).toHaveProperty('answers');
    });

    it('should return correct answer details', async () => {
      // Start, answer, and submit an attempt first
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/start`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: testQuestion.id,
          answer: '4'
        });

      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/submit`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      const res = await request(app)
        .get(`/api/student/results/${testAssessment.id}`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(200);
      expect(res.body.answers.length).toBeGreaterThan(0);
      expect(res.body.answers[0]).toHaveProperty('studentAnswer');
      expect(res.body.answers[0].studentAnswer).toBe('4');
    });
  });
});
