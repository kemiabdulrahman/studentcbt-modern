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

  describe('POST /api/student/assessments/:assessmentId/attempt', () => {
    it('should start an assessment attempt', async () => {
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/attempt`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('attempt');
    });

    it('should not allow duplicate attempts', async () => {
      // Create first attempt
      await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/attempt`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      // Try to create duplicate
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/attempt`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/student/assessments/:assessmentId/answer', () => {
    beforeEach(async () => {
      await createTestAttempt(studentProfile.id, testAssessment.id);
    });

    it('should submit an answer', async () => {
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
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/answer`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'))
        .send({
          questionId: 'non-existent',
          answer: '4'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/student/assessments/:assessmentId/submit', () => {
    beforeEach(async () => {
      const attempt = await createTestAttempt(studentProfile.id, testAssessment.id);
      
      // Submit an answer
      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: testQuestion.id,
          answer: '4',
          isCorrect: true,
          marksAwarded: 10
        }
      });
    });

    it('should submit assessment', async () => {
      const res = await request(app)
        .post(`/api/student/assessments/${testAssessment.id}/submit`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('GET /api/student/results/:assessmentId', () => {
    beforeEach(async () => {
      const attempt = await createTestAttempt(studentProfile.id, testAssessment.id, {
        status: 'SUBMITTED',
        totalScore: 10,
        percentage: 10,
        submittedAt: new Date()
      });

      // Create answer
      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: testQuestion.id,
          answer: '4',
          isCorrect: true,
          marksAwarded: 10
        }
      });
    });

    it('should fetch detailed result', async () => {
      const res = await request(app)
        .get(`/api/student/results/${testAssessment.id}`)
        .set(getAuthHeader(studentUser.id, 'STUDENT'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('assessment');
      expect(res.body).toHaveProperty('answers');
    });

    it('should return correct answer details', async () => {
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
