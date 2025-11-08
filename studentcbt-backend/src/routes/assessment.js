const express = require('express');
const {
  // Admin assessment management
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  
  // Question management
  addQuestion,
  updateQuestion,
  deleteQuestion,
  bulkAddQuestions,
  
  // Results & Analytics
  getAssessmentResults,
  getStudentAttemptDetails,
  toggleResultVisibility,
  getAssessmentAnalytics
} = require('../controllers/assessmentController');

const { authenticateToken, requireAdmin, requireRole } = require('../middleware/auth');
const {
  validateCreateAssessment,
  validateUpdateAssessment,
  validateCreateQuestion,
  validateBulkCreateQuestions,
  validateAssessmentQuery
} = require('../utils/validation').validationMiddlewares;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assessment
 *   description: Assessment management and analytics
 */

// Admin-only routes
router.use(authenticateToken);

// Assessment CRUD Operations (Admin only)
/**
 * @swagger
 * /api/assessment:
 *   post:
 *     tags: [Assessment]
 *     summary: Create a new assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - subjectId
 *               - classId
 *               - duration
 *               - passMarks
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               classId:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 480
 *               passMarks:
 *                 type: integer
 *                 minimum: 0
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               instructions:
 *                 type: string
 *               showResults:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', 
  requireAdmin, 
  validateCreateAssessment, 
  createAssessment
);

/**
 * @swagger
 * /api/assessment:
 *   get:
 *     tags: [Assessment]
 *     summary: Get all assessments with filters (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 */
router.get('/', 
  requireAdmin, 
  validateAssessmentQuery, 
  getAllAssessments
);

/**
 * @swagger
 * /api/assessment/{id}:
 *   get:
 *     tags: [Assessment]
 *     summary: Get assessment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully
 *       404:
 *         description: Assessment not found
 */
router.get('/:id', getAssessmentById);

/**
 * @swagger
 * /api/assessment/{id}:
 *   put:
 *     tags: [Assessment]
 *     summary: Update assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               passMarks:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               instructions:
 *                 type: string
 *               showResults:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *       404:
 *         description: Assessment not found
 */
router.put('/:id', 
  requireAdmin, 
  validateUpdateAssessment, 
  updateAssessment
);

/**
 * @swagger
 * /api/assessment/{id}:
 *   delete:
 *     tags: [Assessment]
 *     summary: Delete assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *       404:
 *         description: Assessment not found
 */
router.delete('/:id', requireAdmin, deleteAssessment);

/**
 * @swagger
 * /api/assessment/{id}/publish:
 *   post:
 *     tags: [Assessment]
 *     summary: Publish assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment published successfully
 *       400:
 *         description: Cannot publish assessment without questions
 */
router.post('/:id/publish', requireAdmin, publishAssessment);

// Question Management Routes (Admin only)
/**
 * @swagger
 * /api/assessment/{assessmentId}/questions:
 *   post:
 *     tags: [Assessment]
 *     summary: Add question to assessment (Admin only)
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - questionType
 *               - correctAnswer
 *               - orderIndex
 *             properties:
 *               questionText:
 *                 type: string
 *               questionType:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK]
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               marks:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               explanation:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Validation error or assessment not in draft status
 */
router.post('/:assessmentId/questions', 
  requireAdmin, 
  validateCreateQuestion, 
  addQuestion
);

/**
 * @swagger
 * /api/assessment/{assessmentId}/questions/bulk:
 *   post:
 *     tags: [Assessment]
 *     summary: Add multiple questions to assessment (Admin only)
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionText
 *                     - questionType
 *                     - correctAnswer
 *                   properties:
 *                     questionText:
 *                       type: string
 *                     questionType:
 *                       type: string
 *                       enum: [MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK]
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *                     marks:
 *                       type: integer
 *                     explanation:
 *                       type: string
 *     responses:
 *       201:
 *         description: Questions added successfully
 */
router.post('/:assessmentId/questions/bulk', 
  requireAdmin, 
  validateBulkCreateQuestions, 
  bulkAddQuestions
);

/**
 * @swagger
 * /api/assessment/questions/{id}:
 *   put:
 *     tags: [Assessment]
 *     summary: Update question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 */
router.put('/questions/:id', requireAdmin, updateQuestion);

/**
 * @swagger
 * /api/assessment/questions/{id}:
 *   delete:
 *     tags: [Assessment]
 *     summary: Delete question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 */
router.delete('/questions/:id', requireAdmin, deleteQuestion);

// Results and Analytics Routes (Admin only)
/**
 * @swagger
 * /api/assessment/{id}/results:
 *   get:
 *     tags: [Assessment]
 *     summary: Get assessment results (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Assessment results retrieved successfully
 */
router.get('/:id/results', requireAdmin, getAssessmentResults);

/**
 * @swagger
 * /api/assessment/{assessmentId}/students/{studentId}/attempt:
 *   get:
 *     tags: [Assessment]
 *     summary: Get detailed student attempt (Admin only)
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
 *         description: Student attempt details retrieved successfully
 */
router.get('/:assessmentId/students/:studentId/attempt', 
  requireAdmin, 
  getStudentAttemptDetails
);

/**
 * @swagger
 * /api/assessment/{id}/toggle-results:
 *   post:
 *     tags: [Assessment]
 *     summary: Toggle result visibility for students (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showResults
 *             properties:
 *               showResults:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Result visibility updated successfully
 */
router.post('/:id/toggle-results', requireAdmin, toggleResultVisibility);

/**
 * @swagger
 * /api/assessment/{id}/analytics:
 *   get:
 *     tags: [Assessment]
 *     summary: Get assessment analytics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment analytics retrieved successfully
 */
router.get('/:id/analytics', requireAdmin, getAssessmentAnalytics);

module.exports = router;