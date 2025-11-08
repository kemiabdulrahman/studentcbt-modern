const express = require('express');
const {
  getAvailableAssessments,
  getAssessmentForExam,
  startAssessment,
  submitAnswer,
  getAttemptStatus,
  submitAssessment,
  getStudentResults,
  getDetailedResult,
  getStudentDashboard
} = require('../controllers/studentController');

const { authenticateToken, requireStudent } = require('../middleware/auth');
const {
  validateSubmitAnswer,
  validatePaginationQuery
} = require('../utils/validation').validationMiddlewares;

const router = express.Router();

// Apply authentication and student role requirement to all routes
router.use(authenticateToken, requireStudent);

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student assessment and result functions
 */

/**
 * @swagger
 * /api/student/dashboard:
 *   get:
 *     tags: [Student]
 *     summary: Get student dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', getStudentDashboard);

/**
 * @swagger
 * /api/student/assessments:
 *   get:
 *     tags: [Student]
 *     summary: Get available assessments for student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available assessments retrieved successfully
 */
router.get('/assessments', getAvailableAssessments);

/**
 * @swagger
 * /api/student/assessments/{id}:
 *   get:
 *     tags: [Student]
 *     summary: Get assessment details for taking exam
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
 *         description: Assessment details retrieved successfully
 *       404:
 *         description: Assessment not found or not available
 *       400:
 *         description: Assessment already attempted
 */
router.get('/assessments/:id', getAssessmentForExam);

/**
 * @swagger
 * /api/student/assessments/{id}/start:
 *   post:
 *     tags: [Student]
 *     summary: Start assessment attempt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Assessment started successfully
 *       400:
 *         description: Assessment already started or not available
 */
router.post('/assessments/:id/start', startAssessment);

/**
 * @swagger
 * /api/student/assessments/{assessmentId}/answer:
 *   post:
 *     tags: [Student]
 *     summary: Submit answer to a question
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
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Assessment not in progress or time exceeded
 */
router.post('/assessments/:assessmentId/answer', 
  validateSubmitAnswer, 
  submitAnswer
);

/**
 * @swagger
 * /api/student/assessments/{assessmentId}/status:
 *   get:
 *     tags: [Student]
 *     summary: Get current attempt status
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
 *         description: Attempt status retrieved successfully
 *       404:
 *         description: Assessment attempt not found
 */
router.get('/assessments/:assessmentId/status', getAttemptStatus);

/**
 * @swagger
 * /api/student/assessments/{assessmentId}/submit:
 *   post:
 *     tags: [Student]
 *     summary: Submit assessment (final submission)
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
 *         description: Assessment submitted successfully
 *       400:
 *         description: Assessment not in progress
 */
router.post('/assessments/:assessmentId/submit', submitAssessment);

/**
 * @swagger
 * /api/student/results:
 *   get:
 *     tags: [Student]
 *     summary: Get student results
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Student results retrieved successfully
 */
router.get('/results', validatePaginationQuery, getStudentResults);

/**
 * @swagger
 * /api/student/results/{assessmentId}:
 *   get:
 *     tags: [Student]
 *     summary: Get detailed result for specific assessment
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
 *         description: Detailed result retrieved successfully
 *       403:
 *         description: Results not available for viewing
 *       404:
 *         description: Assessment result not found
 */
router.get('/results/:assessmentId', getDetailedResult);

module.exports = router;