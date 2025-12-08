const { PrismaClient } = require('@prisma/client');
const { calculateQuestionScore, normalizeAnswer } = require('../services/gradingService');

const prisma = new PrismaClient();

// Get Available Assessments for Student
const getAvailableAssessments = async (req, res) => {
  try {
    const studentId = req.user.student.id;
    const classId = req.user.student.classId;

    const assessments = await prisma.assessment.findMany({
      where: {
        classId,
        status: 'PUBLISHED',
        OR: [
          { startTime: null },
          { startTime: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endTime: null },
              { endTime: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        subject: true,
        _count: {
          select: { questions: true }
        },
        attempts: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            totalScore: true,
            percentage: true,
            submittedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add attempt status to each assessment
    const assessmentsWithStatus = assessments.map(assessment => {
      const studentAttempt = assessment.attempts[0]; // Only one attempt per student
      
      return {
        ...assessment,
        attempts: undefined, // Remove attempts array from response
        attemptStatus: studentAttempt ? {
          hasAttempted: true,
          status: studentAttempt.status,
          score: studentAttempt.totalScore,
          percentage: studentAttempt.percentage,
          submittedAt: studentAttempt.submittedAt
        } : {
          hasAttempted: false,
          status: null,
          score: null,
          percentage: null,
          submittedAt: null
        }
      };
    });

    res.json({ assessments: assessmentsWithStatus });
  } catch (error) {
    console.error('Get available assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Assessment Details for Taking Exam
const getAssessmentForExam = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.student.id;
    const classId = req.user.student.classId;

    // Check if assessment exists and is accessible
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        classId,
        status: 'PUBLISHED',
        OR: [
          { startTime: null },
          { startTime: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endTime: null },
              { endTime: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        subject: true,
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            marks: true,
            orderIndex: true
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ 
        error: 'Assessment not found or not available' 
      });
    }

    // Check if student has already attempted
    const existingAttempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId: id
        }
      }
    });

    if (existingAttempt) {
      return res.status(400).json({ 
        error: 'You have already attempted this assessment',
        attempt: existingAttempt
      });
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment for exam error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Start Assessment Attempt
const startAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.student.id;
    const classId = req.user.student.classId;

    // Validate assessment accessibility
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        classId,
        status: 'PUBLISHED',
        OR: [
          { startTime: null },
          { startTime: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endTime: null },
              { endTime: { gte: new Date() } }
            ]
          }
        ]
      }
    });

    if (!assessment) {
      return res.status(404).json({ 
        error: 'Assessment not found or not available' 
      });
    }

    // Check if already attempted
    const existingAttempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId: id
        }
      }
    });

    if (existingAttempt) {
      return res.status(400).json({ 
        error: 'Assessment already started',
        attempt: existingAttempt
      });
    }

    // Create new attempt
    const attempt = await prisma.attempt.create({
      data: {
        studentId,
        assessmentId: id,
        status: 'IN_PROGRESS'
      },
      include: {
        assessment: {
          select: {
            title: true,
            duration: true,
            instructions: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Assessment started successfully',
      attempt
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit Answer to Question
const submitAnswer = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questionId, answer } = req.body;
    const studentId = req.user.student.id;

    // Get the attempt
    const attempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId
        }
      },
      include: {
        assessment: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Assessment is not in progress' });
    }

    // Check if time has expired
    const timeLimit = attempt.assessment.duration * 60 * 1000; // Convert to milliseconds
    const timeElapsed = Date.now() - attempt.startedAt.getTime();
    
    if (timeElapsed > timeLimit) {
      // Auto-submit the assessment
      await autoSubmitAssessment(attempt.id);
      return res.status(400).json({ error: 'Time limit exceeded. Assessment auto-submitted.' });
    }

    // Get the question
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        assessmentId
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Calculate score for this answer
    const { isCorrect, marksAwarded } = calculateQuestionScore(
      question,
      answer
    );

    // Upsert the answer
    const studentAnswer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId
        }
      },
      update: {
        answer: normalizeAnswer(answer),
        isCorrect,
        marksAwarded
      },
      create: {
        attemptId: attempt.id,
        questionId,
        answer: normalizeAnswer(answer),
        isCorrect,
        marksAwarded
      }
    });

    res.json({
      message: 'Answer submitted successfully',
      answer: studentAnswer
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Current Attempt Status
const getAttemptStatus = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const studentId = req.user.student.id;

    const attempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId
        }
      },
      include: {
        assessment: {
          select: {
            title: true,
            duration: true,
            totalMarks: true,
            _count: {
              select: { questions: true }
            }
          }
        },
        answers: {
          select: {
            questionId: true,
            answer: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Calculate time remaining
    const timeLimit = attempt.assessment.duration * 60 * 1000; // milliseconds
    const timeElapsed = Date.now() - attempt.startedAt.getTime();
    const timeRemaining = Math.max(0, timeLimit - timeElapsed);

    // Check if time expired
    if (timeRemaining === 0 && attempt.status === 'IN_PROGRESS') {
      await autoSubmitAssessment(attempt.id);
      return res.json({
        attempt: {
          ...attempt,
          status: 'TIMED_OUT'
        },
        timeRemaining: 0,
        answeredQuestions: attempt.answers.length,
        totalQuestions: attempt.assessment._count.questions
      });
    }

    res.json({
      attempt,
      timeRemaining: Math.floor(timeRemaining / 1000), // seconds
      answeredQuestions: attempt.answers.length,
      totalQuestions: attempt.assessment._count.questions
    });
  } catch (error) {
    console.error('Get attempt status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit Assessment (Final Submission)
const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const studentId = req.user.student.id;

    const attempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId
        }
      },
      include: {
        assessment: true,
        answers: true
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Assessment is not in progress' });
    }

    // Calculate final score
    const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const percentage = attempt.assessment.totalMarks > 0 
      ? (totalScore / attempt.assessment.totalMarks) * 100 
      : 0;

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Update attempt
    const submittedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        totalScore,
        percentage: parseFloat(percentage.toFixed(2)),
        timeSpent
      },
      include: {
        assessment: {
          select: {
            title: true,
            totalMarks: true,
            passMarks: true,
            showResults: true
          }
        }
      }
    });

    res.json({
      message: 'Assessment submitted successfully',
      attempt: submittedAttempt,
      showResult: submittedAttempt.assessment.showResults
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Auto-submit assessment (used for time expiry)
const autoSubmitAssessment = async (attemptId) => {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        answers: true
      }
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return;
    }

    const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const percentage = attempt.assessment.totalMarks > 0 
      ? (totalScore / attempt.assessment.totalMarks) * 100 
      : 0;

    const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'TIMED_OUT',
        submittedAt: new Date(),
        totalScore,
        percentage: parseFloat(percentage.toFixed(2)),
        timeSpent
      }
    });
  } catch (error) {
    console.error('Auto-submit assessment error:', error);
  }
};

// Get Student Results
const getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.student.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      prisma.attempt.findMany({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'TIMED_OUT'] },
          assessment: {
            showResults: true
          }
        },
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              totalMarks: true,
              passMarks: true,
              subject: {
                select: { name: true }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.attempt.count({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'TIMED_OUT'] },
          assessment: {
            showResults: true
          }
        }
      })
    ]);

    res.json({
      results: attempts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Detailed Result for Specific Assessment
const getDetailedResult = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const studentId = req.user.student.id;

    const attempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId
        }
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passMarks: true,
            showResults: true,
            subject: {
              select: { name: true }
            },
            questions: {
              select: {
                id: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                marks: true,
                explanation: true,
                orderIndex: true
              }
            }
          },
          orderBy: {
            question: { orderIndex: 'asc' }
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment result not found' });
    }

    // Allow students to view their own results immediately after submission (always available to them)
    // The showResults flag only controls whether results are visible to other students/on dashboard
    if (!['SUBMITTED', 'TIMED_OUT'].includes(attempt.status)) {
      return res.status(400).json({ 
        error: 'Assessment not completed yet' 
      });
    }

    // Transform response to match frontend expectations
    const transformedAnswers = attempt.answers.map(answer => {
      return {
        id: answer.id,
        studentAnswer: answer.answer,
        isCorrect: answer.isCorrect,
        marksAwarded: answer.marksAwarded,
        question: {
          id: answer.question.id,
          text: answer.question.questionText,
          type: answer.question.questionType,
          options: answer.question.options,
          correctAnswer: answer.question.correctAnswer,
          marks: answer.question.marks,
          explanation: answer.question.explanation
        }
      };
    });

    const passed = attempt.percentage >= attempt.assessment.passMarks;

    res.json({
      id: attempt.id,
      totalScore: attempt.totalScore,
      percentage: attempt.percentage,
      passed,
      status: attempt.status,
      assessment: {
        id: attempt.assessment.id,
        title: attempt.assessment.title,
        totalMarks: attempt.assessment.totalMarks,
        passMarks: attempt.assessment.passMarks,
        subject: attempt.assessment.subject,
        questions: attempt.assessment.questions
      },
      answers: transformedAnswers
    });
  } catch (error) {
    console.error('Get detailed result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Student Dashboard Stats
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.student.id;
    const classId = req.user.student.classId;

    // Get statistics
    const [
      totalAssessments,
      completedAssessments,
      pendingAssessments,
      averageScore
    ] = await Promise.all([
      // Total assessments available for student's class
      prisma.assessment.count({
        where: {
          classId,
          status: 'PUBLISHED'
        }
      }),
      
      // Completed assessments
      prisma.attempt.count({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'TIMED_OUT'] }
        }
      }),
      
      // Pending assessments (available but not attempted)
      prisma.assessment.count({
        where: {
          classId,
          status: 'PUBLISHED',
          attempts: {
            none: { studentId }
          },
          OR: [
            { startTime: null },
            { startTime: { lte: new Date() } }
          ],
          AND: [
            {
              OR: [
                { endTime: null },
                { endTime: { gte: new Date() } }
              ]
            }
          ]
        }
      }),
      
      // Average score
      prisma.attempt.aggregate({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'TIMED_OUT'] }
        },
        _avg: {
          percentage: true
        }
      })
    ]);

    // Get recent attempts
    const recentAttempts = await prisma.attempt.findMany({
      where: {
        studentId,
        status: { in: ['SUBMITTED', 'TIMED_OUT'] }
      },
      include: {
        assessment: {
          select: {
            title: true,
            totalMarks: true,
            passMarks: true,
            subject: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 5
    });

    res.json({
      statistics: {
        totalAssessments,
        completedAssessments,
        pendingAssessments,
        averageScore: averageScore._avg.percentage || 0
      },
      recentAttempts
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAvailableAssessments,
  getAssessmentForExam,
  startAssessment,
  submitAnswer,
  getAttemptStatus,
  submitAssessment,
  getStudentResults,
  getDetailedResult,
  getStudentDashboard
};