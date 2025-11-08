const express = require('express');
const {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  createClass,
  getAllClasses,
  createSubject,
  getAllSubjects,
  assignSubjectToClass,
  getClassSubjects
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateCreateStudent,
  validateUpdateStudent,
  validateCreateClass,
  validateCreateSubject,
  validateAssignSubject,
  validatePaginationQuery
} = require('../utils/validation').validationMiddlewares;

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative functions
 */

// Student Management Routes
/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 * *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - studentId
 *               - firstName
 *               - lastName
 *               - classId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               studentId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               classId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation error or duplicate student ID
 */
router.post('/students', validateCreateStudent, createStudent);

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     tags: [Admin]
 *     summary: Get all students with pagination
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
 *         name: classId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/students', validatePaginationQuery, getAllStudents);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update student information
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               classId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
router.put('/students/:id', validateUpdateStudent, updateStudent);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a student
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
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/students/:id', deleteStudent);

// Class Management Routes
/**
 * @swagger
 * /api/admin/classes:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new class
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               stream:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/classes', validateCreateClass, createClass);

/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     tags: [Admin]
 *     summary: Get all classes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 */
router.get('/classes', getAllClasses);

// Subject Management Routes
/**
 * @swagger
 * /api/admin/subjects:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new subject
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 */
router.post('/subjects', validateCreateSubject, createSubject);

/**
 * @swagger
 * /api/admin/subjects:
 *   get:
 *     tags: [Admin]
 *     summary: Get all subjects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 */
router.get('/subjects', getAllSubjects);

// Class-Subject Assignment Routes
/**
 * @swagger
 * /api/admin/class-subjects:
 *   post:
 *     tags: [Admin]
 *     summary: Assign subject to class
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - subjectId
 *             properties:
 *               classId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject assigned to class successfully
 */
router.post('/class-subjects', validateAssignSubject, assignSubjectToClass);

/**
 * @swagger
 * /api/admin/classes/{classId}/subjects:
 *   get:
 *     tags: [Admin]
 *     summary: Get subjects for a specific class
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
 *         description: Class subjects retrieved successfully
 */
router.get('/classes/:classId/subjects', getClassSubjects);

module.exports = router;