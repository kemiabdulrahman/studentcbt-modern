/**
 * @swagger
 * /admin/students:
 *   post:
 *     tags:
 *       - Admin - Students
 *     summary: Create a new student
 *     description: Create a new student account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - Admin - Students
 *     summary: Get all students
 *     description: Retrieve a paginated list of all students (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: classId
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /admin/students/{id}:
 *   put:
 *     tags:
 *       - Admin - Students
 *     summary: Update student
 *     description: Update student information (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentRequest'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags:
 *       - Admin - Students
 *     summary: Delete student
 *     description: Delete a student account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Student not found
 *       401:
 *         description: Unauthorized
 *
 * /admin/classes:
 *   post:
 *     tags:
 *       - Admin - Classes
 *     summary: Create a new class
 *     description: Create a new class (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - Admin - Classes
 *     summary: Get all classes
 *     description: Retrieve all classes (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /admin/subjects:
 *   post:
 *     tags:
 *       - Admin - Subjects
 *     summary: Create a new subject
 *     description: Create a new subject (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectRequest'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - Admin - Subjects
 *     summary: Get all subjects
 *     description: Retrieve all subjects (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /admin/class-subjects:
 *   post:
 *     tags:
 *       - Admin - Classes
 *     summary: Assign subject to class
 *     description: Assign a subject to a class (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignSubjectRequest'
 *     responses:
 *       201:
 *         description: Subject assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassSubjectResponse'
 *       401:
 *         description: Unauthorized
 *
 * /admin/classes/{classId}/subjects:
 *   get:
 *     tags:
 *       - Admin - Classes
 *     summary: Get class subjects
 *     description: Get all subjects assigned to a class (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class subjects retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassSubjectsListResponse'
 *       404:
 *         description: Class not found
 *       401:
 *         description: Unauthorized
 */
