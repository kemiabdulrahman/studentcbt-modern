const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const FileProcessor = require('../utils/fileProcessor');
const ExportService = require('../services/exportService');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './src/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload and export functions
 */

// Student Bulk Upload Routes (Admin only)
/**
 * @swagger
 * /api/upload/students/template/{classId}:
 *   get:
 *     tags: [Upload]
 *     summary: Download student upload template (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template file generated successfully
 *       404:
 *         description: Class not found
 */
router.get('/students/template/:classId', requireAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId }
    });
    
    if (!schoolClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const result = await ExportService.exportClassListTemplate(schoolClass);
    
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        FileProcessor.cleanupFile(result.filePath);
      }, 5000);
    });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

/**
 * @swagger
 * /api/upload/students/validate:
 *   post:
 *     tags: [Upload]
 *     summary: Validate student upload file (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File validated successfully
 *       400:
 *         description: Validation errors found
 */
router.post('/students/validate', 
  requireAdmin, 
  upload.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Validate file type and size
      const fileValidation = FileProcessor.validateStudentUploadFile(req.file);
      if (!fileValidation.isValid) {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(400).json({
          error: 'File validation failed',
          details: fileValidation.errors
        });
      }
      
      // Parse and validate file content
      const parseResult = await FileProcessor.parseStudentUploadFile(req.file.path);
      
      // Clean up file
      FileProcessor.cleanupFile(req.file.path);
      
      if (!parseResult.isValid) {
        return res.status(400).json({
          error: 'File content validation failed',
          details: parseResult.errors,
          summary: parseResult.summary
        });
      }
      
      // Check for existing students in database
      const existingChecks = await Promise.all([
        // Check existing student IDs
        prisma.student.findMany({
          where: {
            studentId: {
              in: parseResult.students.map(s => s.studentId)
            }
          },
          select: { studentId: true }
        }),
        
        // Check existing emails
        prisma.user.findMany({
          where: {
            email: {
              in: parseResult.students.map(s => s.email)
            }
          },
          select: { email: true }
        })
      ]);
      
      const existingStudentIds = existingChecks[0].map(s => s.studentId);
      const existingEmails = existingChecks[1].map(u => u.email);
      
      const conflicts = {
        studentIds: existingStudentIds,
        emails: existingEmails
      };
      
      res.json({
        message: 'File validated successfully',
        data: {
          summary: parseResult.summary,
          conflicts,
          hasConflicts: existingStudentIds.length > 0 || existingEmails.length > 0,
          previewStudents: parseResult.students.slice(0, 5) // Show first 5 for preview
        }
      });
      
    } catch (error) {
      if (req.file) {
        FileProcessor.cleanupFile(req.file.path);
      }
      console.error('Student validation error:', error);
      res.status(500).json({ error: 'Failed to validate file' });
    }
  }
);

/**
 * @swagger
 * /api/upload/students/{classId}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload and create students from file (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Students created successfully
 *       400:
 *         description: File validation errors
 */
router.post('/students/:classId', 
  requireAdmin, 
  upload.single('file'), 
  async (req, res) => {
    try {
      const { classId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Verify class exists
      const schoolClass = await prisma.schoolClass.findUnique({
        where: { id: classId }
      });
      
      if (!schoolClass) {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(404).json({ error: 'Class not found' });
      }
      
      // Validate and parse file
      const fileValidation = FileProcessor.validateStudentUploadFile(req.file);
      if (!fileValidation.isValid) {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(400).json({
          error: 'File validation failed',
          details: fileValidation.errors
        });
      }
      
      const parseResult = await FileProcessor.parseStudentUploadFile(req.file.path);
      FileProcessor.cleanupFile(req.file.path);
      
      if (!parseResult.isValid) {
        return res.status(400).json({
          error: 'File content validation failed',
          details: parseResult.errors,
          summary: parseResult.summary
        });
      }
      
      // Create students in transaction
      const results = {
        created: [],
        errors: []
      };
      
      for (const studentData of parseResult.students) {
        try {
          // Check for existing student ID or email
          const [existingStudent, existingUser] = await Promise.all([
            prisma.student.findUnique({
              where: { studentId: studentData.studentId }
            }),
            prisma.user.findUnique({
              where: { email: studentData.email }
            })
          ]);
          
          if (existingStudent) {
            results.errors.push({
              studentId: studentData.studentId,
              error: 'Student ID already exists'
            });
            continue;
          }
          
          if (existingUser) {
            results.errors.push({
              studentId: studentData.studentId,
              error: 'Email already exists'
            });
            continue;
          }
          
          // Create user and student
          const hashedPassword = await bcrypt.hash(studentData.password, 10);
          
          const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                email: studentData.email,
                password: hashedPassword,
                role: 'STUDENT'
              }
            });
            
            const student = await tx.student.create({
              data: {
                userId: user.id,
                studentId: studentData.studentId,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                classId: classId
              }
            });
            
            return { user, student };
          });
          
          results.created.push({
            studentId: studentData.studentId,
            email: studentData.email,
            name: `${studentData.firstName} ${studentData.lastName}`
          });
          
        } catch (error) {
          console.error(`Error creating student ${studentData.studentId}:`, error);
          results.errors.push({
            studentId: studentData.studentId,
            error: error.message
          });
        }
      }
      
      res.status(201).json({
        message: 'Student upload completed',
        summary: {
          total: parseResult.students.length,
          created: results.created.length,
          errors: results.errors.length
        },
        details: results
      });
      
    } catch (error) {
      if (req.file) {
        FileProcessor.cleanupFile(req.file.path);
      }
      console.error('Student upload error:', error);
      res.status(500).json({ error: 'Failed to upload students' });
    }
  }
);

// Question Upload Routes (Admin only)
/**
 * @swagger
 * /api/upload/questions/{assessmentId}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload questions from file (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Questions uploaded successfully
 *       400:
 *         description: File validation errors
 */
router.post('/questions/:assessmentId', 
  requireAdmin, 
  upload.single('file'), 
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Verify assessment exists and is in draft status
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId }
      });
      
      if (!assessment) {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(404).json({ error: 'Assessment not found' });
      }
      
      if (assessment.status !== 'DRAFT') {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(400).json({
          error: 'Cannot add questions to published assessment'
        });
      }
      
      // Validate and parse file
      const fileValidation = FileProcessor.validateQuestionUploadFile(req.file);
      if (!fileValidation.isValid) {
        FileProcessor.cleanupFile(req.file.path);
        return res.status(400).json({
          error: 'File validation failed',
          details: fileValidation.errors
        });
      }
      
      const parseResult = await FileProcessor.parseQuestionUploadFile(req.file.path);
      FileProcessor.cleanupFile(req.file.path);
      
      if (!parseResult.isValid) {
        return res.status(400).json({
          error: 'File content validation failed',
          details: parseResult.errors,
          summary: parseResult.summary
        });
      }
      
      // Create questions in transaction
      const createdQuestions = await prisma.$transaction(
        parseResult.questions.map(questionData => 
          prisma.question.create({
            data: {
              ...questionData,
              assessmentId
            }
          })
        )
      );
      
      res.status(201).json({
        message: `${createdQuestions.length} questions uploaded successfully`,
        summary: {
          total: parseResult.questions.length,
          created: createdQuestions.length
        },
        questions: createdQuestions
      });
      
    } catch (error) {
      if (req.file) {
        FileProcessor.cleanupFile(req.file.path);
      }
      console.error('Question upload error:', error);
      res.status(500).json({ error: 'Failed to upload questions' });
    }
  }
);

// Export Routes (Admin only)
/**
 * @swagger
 * /api/upload/export/results/{assessmentId}/pdf:
 *   get:
 *     tags: [Upload]
 *     summary: Export assessment results as PDF (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file generated and downloaded
 *       404:
 *         description: Assessment not found
 */
router.get('/export/results/:assessmentId/pdf', requireAdmin, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    // Get assessment with results
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subject: true,
        class: true,
        attempts: {
          where: {
            status: { in: ['SUBMITTED', 'TIMED_OUT'] }
          },
          include: {
            student: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const result = await ExportService.exportResultsToPDF(assessment, assessment.attempts);
    
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        FileProcessor.cleanupFile(result.filePath);
      }, 5000);
    });
    
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

/**
 * @swagger
 * /api/upload/export/results/{assessmentId}/excel:
 *   get:
 *     tags: [Upload]
 *     summary: Export assessment results as Excel (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file generated and downloaded
 *       404:
 *         description: Assessment not found
 */
router.get('/export/results/:assessmentId/excel', requireAdmin, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    // Get assessment with results
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subject: true,
        class: true,
        attempts: {
          where: {
            status: { in: ['SUBMITTED', 'TIMED_OUT'] }
          },
          include: {
            student: {
              include: {
                user: {
                  select: { email: true }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const result = await ExportService.exportResultsToExcel(assessment, assessment.attempts);
    
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        FileProcessor.cleanupFile(result.filePath);
      }, 5000);
    });
    
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

/**
 * @swagger
 * /api/upload/export/answer-sheet/{assessmentId}/{studentId}:
 *   get:
 *     tags: [Upload]
 *     summary: Export individual student answer sheet as PDF (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer sheet PDF generated and downloaded
 *       404:
 *         description: Attempt not found
 */
router.get('/export/answer-sheet/:assessmentId/:studentId', requireAdmin, async (req, res) => {
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
        student: true,
        assessment: {
          select: {
            title: true,
            totalMarks: true,
            passMarks: true
          }
        },
        answers: {
          include: {
            question: true
          },
          orderBy: {
            question: { orderIndex: 'asc' }
          }
        }
      }
    });
    
    if (!attempt) {
      return res.status(404).json({ error: 'Student attempt not found' });
    }
    
    const result = await ExportService.exportStudentAnswerSheet(attempt);
    
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        FileProcessor.cleanupFile(result.filePath);
      }, 5000);
    });
    
  } catch (error) {
    console.error('Answer sheet export error:', error);
    res.status(500).json({ error: 'Failed to export answer sheet' });
  }
});

module.exports = router;