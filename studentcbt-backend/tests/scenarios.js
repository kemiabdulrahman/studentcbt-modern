// Common test scenarios and helpers
const { prisma } = require('./utils');

/**
 * Create a complete test scenario with user, class, subject, and assessment
 */
const createFullTestScenario = async (overrides = {}) => {
  const { createTestUser, createTestStudent, createTestClass, createTestSubject, createTestAssessment, createTestQuestion } = require('./utils');
  
  const user = await createTestUser(overrides.email || 'student@example.com', overrides.role || 'STUDENT');
  const schoolClass = await createTestClass(overrides.className || 'JSS1', overrides.stream || 'Science');
  const subject = await createTestSubject(overrides.subjectName || 'Mathematics');
  const student = await createTestStudent(schoolClass.id, user.id, overrides.studentId);
  
  const assessment = await createTestAssessment(
    schoolClass.id,
    subject.id,
    {
      title: overrides.assessmentTitle || 'Test Assessment',
      totalMarks: overrides.totalMarks || 100,
      passMarks: overrides.passMarks || 50,
      ...overrides.assessmentData
    }
  );

  // Create questions if not specified
  let questions = [];
  if (overrides.questionCount !== 0) {
    const count = overrides.questionCount || 5;
    for (let i = 0; i < count; i++) {
      const question = await createTestQuestion(assessment.id, {
        questionText: `Question ${i + 1}?`,
        correctAnswer: `Answer ${i + 1}`,
        marks: 10,
        orderIndex: i + 1,
        ...overrides.questionOverrides
      });
      questions.push(question);
    }
  }

  return {
    user,
    schoolClass,
    subject,
    student,
    assessment,
    questions
  };
};

/**
 * Simulate a student taking an assessment
 */
const simulateAssessmentAttempt = async (studentId, assessmentId, answers = {}) => {
  const { createTestAttempt } = require('./utils');
  
  const attempt = await createTestAttempt(studentId, assessmentId);
  
  // Get questions for this assessment
  const questions = await prisma.question.findMany({
    where: { assessmentId }
  });

  let totalScore = 0;
  for (const question of questions) {
    const studentAnswer = answers[question.id] || question.correctAnswer;
    const isCorrect = studentAnswer === question.correctAnswer;
    const marksAwarded = isCorrect ? question.marks : 0;
    totalScore += marksAwarded;

    await prisma.answer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        answer: studentAnswer,
        isCorrect,
        marksAwarded
      }
    });
  }

  // Update attempt with final score
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });

  const percentage = (totalScore / assessment.totalMarks) * 100;

  const updatedAttempt = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      status: 'SUBMITTED',
      totalScore,
      percentage,
      submittedAt: new Date(),
      timeSpent: 3600 // 1 hour
    },
    include: {
      answers: true,
      assessment: true
    }
  });

  return updatedAttempt;
};

/**
 * Create multiple students for batch testing
 */
const createMultipleStudents = async (count = 5, classId) => {
  const { createTestUser, createTestStudent } = require('./utils');
  const students = [];

  for (let i = 0; i < count; i++) {
    const user = await createTestUser(`student${i}@example.com`, 'STUDENT');
    const student = await createTestStudent(classId, user.id, `STU${String(i + 1).padStart(3, '0')}`);
    students.push({ user, student });
  }

  return students;
};

/**
 * Verify assessment statistics
 */
const verifyAssessmentStats = async (assessmentId) => {
  const attempts = await prisma.attempt.findMany({
    where: { assessmentId, status: 'SUBMITTED' },
    include: { answers: true }
  });

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });

  const stats = {
    totalAttempts: attempts.length,
    passCount: 0,
    failCount: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: attempts.length > 0 ? Infinity : 0,
    scores: []
  };

  attempts.forEach(attempt => {
    const percentage = (attempt.totalScore / assessment.totalMarks) * 100;
    stats.scores.push(attempt.totalScore);
    
    if (percentage >= assessment.passMarks) {
      stats.passCount++;
    } else {
      stats.failCount++;
    }

    stats.highestScore = Math.max(stats.highestScore, attempt.totalScore);
    stats.lowestScore = Math.min(stats.lowestScore, attempt.totalScore);
  });

  if (stats.scores.length > 0) {
    stats.averageScore = stats.scores.reduce((a, b) => a + b) / stats.scores.length;
  }

  return stats;
};

/**
 * Create assessment with specific question types
 */
const createAssessmentWithMixedQuestions = async (assessmentId) => {
  const { createTestQuestion } = require('./utils');
  
  const questions = await Promise.all([
    // Multiple choice
    createTestQuestion(assessmentId, {
      questionText: 'What is the capital of France?',
      questionType: 'MULTIPLE_CHOICE',
      options: ['Paris', 'Lyon', 'Marseille'],
      correctAnswer: 'Paris',
      marks: 5
    }),
    // True/False
    createTestQuestion(assessmentId, {
      questionText: 'The Earth is flat.',
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctAnswer: 'False',
      marks: 5
    }),
    // Fill in blank
    createTestQuestion(assessmentId, {
      questionText: 'The chemical symbol for Gold is ___',
      questionType: 'FILL_BLANK',
      correctAnswer: 'Au',
      marks: 5
    })
  ]);

  return questions;
};

module.exports = {
  createFullTestScenario,
  simulateAssessmentAttempt,
  createMultipleStudents,
  verifyAssessmentStats,
  createAssessmentWithMixedQuestions
};
