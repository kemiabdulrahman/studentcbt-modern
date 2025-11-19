/**
 * @swagger
 * /student/dashboard:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get student dashboard
 *     description: Get dashboard statistics for the current student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       401:
 *         description: Unauthorized
 *
 * /student/assessments:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get available assessments
 *     description: Get list of assessments available to the current student
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
 * /student/assessments/{id}:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get assessment details
 *     description: Get detailed information about an assessment
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
 * /student/assessments/{id}/start:
 *   post:
 *     tags:
 *       - Student
 *     summary: Start assessment
 *     description: Start taking an assessment
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
 *         description: Assessment started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttemptStatusResponse'
 *       400:
 *         description: Cannot start assessment (already attempted, closed, etc.)
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /student/assessments/{assessmentId}/status:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get attempt status
 *     description: Get current status of an ongoing assessment attempt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assessmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttemptStatusResponse'
 *       404:
 *         description: Attempt not found
 *       401:
 *         description: Unauthorized
 *
 * /student/assessments/{assessmentId}/answer:
 *   post:
 *     tags:
 *       - Student
 *     summary: Submit answer
 *     description: Submit an answer to a question during an assessment
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
 *             $ref: '#/components/schemas/SubmitAnswerRequest'
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 answered:
 *                   type: boolean
 *       400:
 *         description: Validation error or time expired
 *       404:
 *         description: Assessment or question not found
 *       401:
 *         description: Unauthorized
 *
 * /student/assessments/{assessmentId}/submit:
 *   post:
 *     tags:
 *       - Student
 *     summary: Submit assessment
 *     description: Submit a completed assessment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assessmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 score:
 *                   type: number
 *                 totalMarks:
 *                   type: integer
 *                 percentage:
 *                   type: number
 *       400:
 *         description: Cannot submit - already submitted or time expired
 *       404:
 *         description: Assessment not found
 *       401:
 *         description: Unauthorized
 *
 * /student/results:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get student results
 *     description: Get paginated list of past assessment results
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
 *     responses:
 *       200:
 *         description: Results retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultsListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /student/results/{assessmentId}:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get result details
 *     description: Get detailed results and Q&A for a specific assessment attempt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assessmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultDetailResponse'
 *       403:
 *         description: Results not yet available for this assessment
 *       404:
 *         description: Result not found
 *       401:
 *         description: Unauthorized
 */
