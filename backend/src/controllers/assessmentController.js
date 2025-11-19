const { PrismaClient } = require('@prisma/client');
const { calculateGrades } = require('../services/gradingService');

const prisma = new PrismaClient();

// Admin Assessment Management
const createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      subjectId,
      classId,
      duration,
      passMarks,
      startTime,
      endTime,
      instructions,
      showResults = false
    } = req.body;

    // Validate class-subject relationship
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        classId,
        subjectId
      }
    });

    if (!classSubject) {
      return res.status(400).json({
        error: 'Invalid class-subject combination',
        message: 'This subject is not assigned to the specified class'
      });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        subjectId,
        classId,
        duration,
        passMarks,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        instructions,
        showResults
      },
      include: {
        subject: true,
        class: true,
        _count: {
          select: { questions: true, attempts: true }
        }
      }
    });

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, classId, subjectId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (status) where.status = status;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        include: {
          subject: true,
          class: true,
          _count: {
            select: { questions: true, attempts: true }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.assessment.count({ where })
    ]);

    res.json({
      assessments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        questions: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { attempts: true }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if provided
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        class: true,
        _count: {
          select: { questions: true, attempts: true }
        }
      }
    });

    res.json({
      message: 'Assessment updated successfully',
      assessment
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.assessment.delete({
      where: { id }
    });

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const publishAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assessment has questions
    const questionCount = await prisma.question.count({
      where: { assessmentId: id }
    });

    if (questionCount === 0) {
      return res.status(400).json({
        error: 'Cannot publish assessment without questions'
      });
    }

    // Calculate total marks
    const totalMarks = await prisma.question.aggregate({
      where: { assessmentId: id },
      _sum: { marks: true }
    });

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        totalMarks: totalMarks._sum.marks || 0
      },
      include: {
        subject: true,
        class: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    res.json({
      message: 'Assessment published successfully',
      assessment
    });
  } catch (error) {
    console.error('Publish assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Question Management
const addQuestion = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      marks = 1,
      explanation,
      orderIndex
    } = req.body;

    // Validate question type and options
    if (questionType === 'MULTIPLE_CHOICE' && (!options || options.length < 2)) {
      return res.status(400).json({
        error: 'Multiple choice questions must have at least 2 options'
      });
    }

    // Check if assessment exists and is in draft status
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'DRAFT') {
      return res.status(400).json({
        error: 'Cannot add questions to published assessment'
      });
    }

    const question = await prisma.question.create({
      data: {
        assessmentId,
        questionText,
        questionType,
        options: questionType === 'MULTIPLE_CHOICE' ? options : null,
        correctAnswer,
        marks,
        explanation,
        orderIndex
      }
    });

    res.status(201).json({
      message: 'Question added successfully',
      question
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if the assessment is still in draft
    const question = await prisma.question.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.assessment.status !== 'DRAFT') {
      return res.status(400).json({
        error: 'Cannot modify questions in published assessment'
      });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the assessment is still in draft
    const question = await prisma.question.findUnique({
      where: { id },
      include: { assessment: true }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.assessment.status !== 'DRAFT') {
      return res.status(400).json({
        error: 'Cannot delete questions from published assessment'
      });
    }

    await prisma.question.delete({
      where: { id }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const bulkAddQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'Questions array is required'
      });
    }

    // Check if assessment exists and is in draft status
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'DRAFT') {
      return res.status(400).json({
        error: 'Cannot add questions to published assessment'
      });
    }

    // Prepare questions for bulk insert
    const questionsToCreate = questions.map((q, index) => ({
      assessmentId,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.questionType === 'MULTIPLE_CHOICE' ? q.options : null,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      explanation: q.explanation || null,
      orderIndex: q.orderIndex || index + 1
    }));

    // Create questions in transaction
    const createdQuestions = await prisma.$transaction(
      questionsToCreate.map(question => 
        prisma.question.create({ data: question })
      )
    );

    res.status(201).json({
      message: `${createdQuestions.length} questions added successfully`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Bulk add questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Assessment Results and Analytics
const getAssessmentResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      select: { title: true, totalMarks: true, passMarks: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const [attempts, total] = await Promise.all([
      prisma.attempt.findMany({
        where: {
          assessmentId: id,
          status: 'SUBMITTED'
        },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              firstName: true,
              lastName: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.attempt.count({
        where: {
          assessmentId: id,
          status: 'SUBMITTED'
        }
      })
    ]);

    // Calculate statistics
    const scores = attempts.map(attempt => attempt.totalScore);
    const statistics = {
      totalAttempts: total,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      passCount: attempts.filter(attempt => attempt.totalScore >= assessment.passMarks).length,
      failCount: attempts.filter(attempt => attempt.totalScore < assessment.passMarks).length
    };

    res.json({
      assessment: {
        title: assessment.title,
        totalMarks: assessment.totalMarks,
        passMarks: assessment.passMarks
      },
      results: attempts,
      statistics,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get assessment results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentAttemptDetails = async (req, res) => {
  try {
    const { assessmentId, studentId } = req.params;

    const attempt = await prisma.attempt.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId
        }
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true
          }
        },
        assessment: {
          select: {
            title: true,
            totalMarks: true,
            passMarks: true,
            showResults: true
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
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json({ attempt });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const toggleResultVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { showResults } = req.body;

    const assessment = await prisma.assessment.update({
      where: { id },
      data: { showResults },
      select: {
        id: true,
        title: true,
        showResults: true
      }
    });

    res.json({
      message: `Results ${showResults ? 'enabled' : 'disabled'} for students`,
      assessment
    });
  } catch (error) {
    console.error('Toggle result visibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssessmentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: {
              where: {
                attempt: {
                  status: 'SUBMITTED'
                }
              }
            }
          }
        },
        attempts: {
          where: { status: 'SUBMITTED' }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Question-wise analysis
    const questionAnalytics = assessment.questions.map(question => {
      const totalAnswers = question.answers.length;
      const correctAnswers = question.answers.filter(answer => answer.isCorrect).length;
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        totalAttempts: totalAnswers,
        correctAttempts: correctAnswers,
        difficulty: totalAnswers > 0 ? (1 - (correctAnswers / totalAnswers)) : 0,
        averageMarks: totalAnswers > 0 
          ? question.answers.reduce((sum, answer) => sum + answer.marksAwarded, 0) / totalAnswers 
          : 0
      };
    });

    // Score distribution
    const scoreRanges = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0
    };

    assessment.attempts.forEach(attempt => {
      const percentage = (attempt.totalScore / assessment.totalMarks) * 100;
      if (percentage <= 25) scoreRanges['0-25%']++;
      else if (percentage <= 50) scoreRanges['26-50%']++;
      else if (percentage <= 75) scoreRanges['51-75%']++;
      else scoreRanges['76-100%']++;
    });

    res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        totalMarks: assessment.totalMarks,
        passMarks: assessment.passMarks
      },
      questionAnalytics,
      scoreDistribution: scoreRanges,
      totalSubmissions: assessment.attempts.length
    });
  } catch (error) {
    console.error('Get assessment analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  // Assessment Management
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  
  // Question Management
  addQuestion,
  updateQuestion,
  deleteQuestion,
  bulkAddQuestions,
  
  // Results & Analytics
  getAssessmentResults,
  getStudentAttemptDetails,
  toggleResultVisibility,
  getAssessmentAnalytics
};