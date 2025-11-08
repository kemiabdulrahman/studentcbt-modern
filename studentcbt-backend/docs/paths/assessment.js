/**
 * @swagger
 * /assessment:
 *   post:
 *     tags:
 *       - Assessments
 *     summary: Create a new assessment
 *     description: Create a new assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssessmentRequest'
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags:
 *       - Assessments
 *     summary: Get all assessments
 *     description: Retrieve a paginated list of assessments
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
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - name: classId
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessments list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentsListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{id}:
 *   get:
 *     tags:
 *       - Assessments
 *     summary: Get assessment details
 *     description: Retrieve detailed information about an assessment
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
 *         description: Assessment details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentDetailResponse'
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     tags:
 *       - Assessments
 *     summary: Update assessment
 *     description: Update assessment information (Admin only)
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
 *             $ref: '#/components/schemas/UpdateAssessmentRequest'
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags:
 *       - Assessments
 *     summary: Delete assessment
 *     description: Delete an assessment (Admin only)
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
 *         description: Assessment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{id}/publish:
 *   post:
 *     tags:
 *       - Assessments
 *     summary: Publish assessment
 *     description: Publish an assessment to make it available to students (Admin only)
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
 *         description: Assessment published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssessmentResponse'
 *       400:
 *         description: Cannot publish - missing questions or other validation error
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{id}/toggle-results:
 *   post:
 *     tags:
 *       - Assessments
 *     summary: Toggle result visibility
 *     description: Show or hide assessment results for students (Admin only)
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
 *             type: object
 *             properties:
 *               showResults:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Result visibility toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 showResults:
 *                   type: boolean
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{id}/results:
 *   get:
 *     tags:
 *       - Assessments
 *     summary: Get assessment results
 *     description: Retrieve paginated results for an assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Assessment results retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttemptsListResponse'
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{assessmentId}/students/{studentId}/attempt:
 *   get:
 *     tags:
 *       - Assessments
 *     summary: Get student attempt
 *     description: Retrieve a student's attempt details for an assessment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assessmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student attempt retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttemptStatusResponse'
 *       404:
 *         description: Attempt not found
 *       401:
 *         description: Unauthorized
 *
 * /assessment/{assessmentId}/questions:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Add question to assessment
 *     description: Add a new question to an assessment (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assessmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /assessment/questions/{id}:
 *   put:
 *     tags:
 *       - Questions
 *     summary: Update question
 *     description: Update an assessment question (Admin only)
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
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionResponse'
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete question
 *     description: Delete an assessment question (Admin only)
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
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 */
