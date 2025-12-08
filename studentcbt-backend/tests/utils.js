// Test utilities
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Generate a test JWT token
 */
const generateToken = (userId, role = 'STUDENT') => {
  return jwt.sign(
    { userId: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Generate a test auth header
 */
const getAuthHeader = (userId, role = 'STUDENT') => {
  const token = generateToken(userId, role);
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Cleanup database after tests
 * Deletes in proper order respecting foreign key constraints
 */
const cleanupDatabase = async () => {
  try {
    // Delete in reverse order of foreign key dependencies
    // PostgreSQL: No need for foreign key check disabling if we delete in correct order
    await prisma.answer.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.attempt.deleteMany({});
    await prisma.assessment.deleteMany({});
    await prisma.classSubject.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.schoolClass.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (err) {
    console.error('Error cleaning database:', err);
    // Try truncating with cascade as fallback
    try {
      await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE answers, questions, attempts, assessments, 
                       class_subjects, students, classes, subjects, users 
        RESTART IDENTITY CASCADE
      `);
    } catch (e) {
      console.error('Fallback cleanup also failed:', e.message);
    }
  }
};

/**
 * Create a test user
 */
const createTestUser = async (email = 'test@example.com', role = 'STUDENT') => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  });
};

/**
 * Create a test student
 */
const createTestStudent = async (classId, userId, studentId = 'STU001') => {
  return prisma.student.create({
    data: {
      userId,
      studentId,
      firstName: 'Test',
      lastName: 'Student',
      classId
    }
  });
};

/**
 * Create a test class
 */
const createTestClass = async (name = 'JSS1', stream = 'Science') => {
  return prisma.schoolClass.create({
    data: {
      name,
      stream
    }
  });
};

/**
 * Create a test subject
 */
const createTestSubject = async (name = 'Mathematics') => {
  return prisma.subject.create({
    data: {
      name
    }
  });
};

/**
 * Create a test assessment
 */
const createTestAssessment = async (classId, subjectId, overrides = {}) => {
  return prisma.assessment.create({
    data: {
      title: 'Test Assessment',
      description: 'Test Description',
      classId,
      subjectId,
      duration: 60,
      totalMarks: 100,
      passMarks: 50,
      status: 'PUBLISHED',
      showResults: true,
      ...overrides
    }
  });
};

/**
 * Create a test question
 */
const createTestQuestion = async (assessmentId, overrides = {}) => {
  return prisma.question.create({
    data: {
      assessmentId,
      questionText: 'Test Question?',
      questionType: 'MULTIPLE_CHOICE',
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswer: 'Option A',
      marks: 10,
      explanation: 'Test explanation',
      orderIndex: 1,
      ...overrides
    }
  });
};

/**
 * Create a test attempt
 */
const createTestAttempt = async (studentId, assessmentId, overrides = {}) => {
  return prisma.attempt.create({
    data: {
      studentId,
      assessmentId,
      status: 'IN_PROGRESS',
      ...overrides
    }
  });
};

module.exports = {
  prisma,
  generateToken,
  getAuthHeader,
  cleanupDatabase,
  createTestUser,
  createTestStudent,
  createTestClass,
  createTestSubject,
  createTestAssessment,
  createTestQuestion,
  createTestAttempt
};
