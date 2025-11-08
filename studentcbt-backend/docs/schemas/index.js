/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *               enum: [ADMIN, STUDENT]
 *             isActive:
 *               type: boolean
 *         tokens:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *
 *     TokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, STUDENT]
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
     *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *         confirmPassword:
 *           type: string
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token from login
 *
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - studentId
 *         - firstName
 *         - lastName
 *         - classId
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         studentId:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         classId:
 *           type: string
 *         phone:
 *           type: string
 *
 *     StudentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         studentId:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         classId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     StudentListResponse:
 *       type: object
 *       properties:
 *         students:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudentResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 *             currentPage:
 *               type: integer
 *             limit:
 *               type: integer
 *
 *     UpdateStudentRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         classId:
 *           type: string
 *         isActive:
 *           type: boolean
 *
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: JSS1
 *         stream:
 *           type: string
 *           example: Science
 *
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Mathematics
 *
 *     AssignSubjectRequest:
 *       type: object
 *       required:
 *         - classId
 *         - subjectId
 *       properties:
 *         classId:
 *           type: string
 *         subjectId:
 *           type: string
 *
 *     CreateAssessmentRequest:
 *       type: object
 *       required:
 *         - title
 *         - subjectId
 *         - classId
 *         - duration
 *         - passMarks
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 1000
 *         subjectId:
 *           type: string
 *         classId:
 *           type: string
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *           minimum: 5
 *           maximum: 480
 *         totalMarks:
 *           type: integer
 *         passMarks:
 *           type: integer
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         instructions:
 *           type: string
 *           maxLength: 2000
 *         showResults:
 *           type: boolean
 *
 *     UpdateAssessmentRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *         passMarks:
 *           type: integer
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         instructions:
 *           type: string
 *         showResults:
 *           type: boolean
 *
 *     CreateQuestionRequest:
 *       type: object
 *       required:
 *         - questionText
 *         - questionType
 *         - correctAnswer
 *         - marks
 *         - orderIndex
 *       properties:
 *         questionText:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *         questionType:
 *           type: string
 *           enum: [MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK]
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Required for MULTIPLE_CHOICE type
 *         correctAnswer:
 *           type: string
 *           maxLength: 200
 *         marks:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         explanation:
 *           type: string
 *           maxLength: 500
 *         orderIndex:
 *           type: integer
 *           minimum: 1
 *
 *     UpdateQuestionRequest:
 *       type: object
 *       properties:
 *         questionText:
 *           type: string
 *         questionType:
 *           type: string
 *           enum: [MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK]
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         correctAnswer:
 *           type: string
 *         marks:
 *           type: integer
 *         explanation:
 *           type: string
 *         orderIndex:
 *           type: integer
 *
 *     SubmitAnswerRequest:
 *       type: object
 *       required:
 *         - questionId
 *         - answer
 *       properties:
 *         questionId:
 *           type: string
 *         answer:
 *           type: string
 *           maxLength: 500
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *
     *     AssessmentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         subjectId:
 *           type: string
 *         classId:
 *           type: string
 *         duration:
 *           type: integer
 *         totalMarks:
 *           type: integer
 *         passMarks:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         showResults:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ClassResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         stream:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ClassListResponse:
 *       type: object
 *       properties:
 *         classes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassResponse'
 *
 *     SubjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SubjectListResponse:
 *       type: object
 *       properties:
 *         subjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubjectResponse'
 *
 *     ClassSubjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         classId:
 *           type: string
 *         subjectId:
 *           type: string
 *         subject:
 *           $ref: '#/components/schemas/SubjectResponse'
 *
 *     ClassSubjectsListResponse:
 *       type: object
 *       properties:
 *         subjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassSubjectResponse'
 *
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         totalAssessments:
 *           type: integer
 *         completedAssessments:
 *           type: integer
 *         pendingAssessments:
 *           type: integer
 *         averageScore:
 *           type: number
 *         recentResults:
 *           type: array
 *           items:
 *             type: object
 *
 *     AssessmentsListResponse:
 *       type: object
 *       properties:
 *         assessments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AssessmentResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 *             currentPage:
 *               type: integer
 *             limit:
 *               type: integer
 *
 *     AssessmentDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *         totalMarks:
 *           type: integer
 *         passMarks:
 *           type: integer
 *         status:
 *           type: string
 *         showResults:
 *           type: boolean
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     QuestionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         questionText:
 *           type: string
 *         questionType:
 *           type: string
 *           enum: [MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK]
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         marks:
 *           type: integer
 *         explanation:
 *           type: string
 *         orderIndex:
 *           type: integer
 *
 *     AttemptsListResponse:
 *       type: object
 *       properties:
 *         attempts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               studentId:
 *                 type: string
 *               score:
 *                 type: number
 *               totalMarks:
 *                 type: integer
 *               status:
 *                 type: string
 *               submittedAt:
 *                 type: string
 *                 format: date-time
 *         pagination:
 *           type: object
 *
 *     AttemptStatusResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         status:
 *           type: string
 *         currentQuestionIndex:
 *           type: integer
 *         totalQuestions:
 *           type: integer
 *         timeRemaining:
 *           type: integer
 *         answeredQuestions:
 *           type: integer
 *
 *     ResultDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         assessmentTitle:
 *           type: string
 *         score:
 *           type: number
 *         totalMarks:
 *           type: integer
 *         percentage:
 *           type: number
 *         status:
 *           type: string
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *
 *     ResultsListResponse:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ResultDetailResponse'
 *         pagination:
 *           type: object
 */