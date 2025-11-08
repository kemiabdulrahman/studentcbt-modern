/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {'ADMIN' | 'STUDENT'} role
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {Student} [student]
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} userId
 * @property {string} studentId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} classId
 * @property {SchoolClass} class
 * @property {User} user
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SchoolClass
 * @property {string} id
 * @property {string} name
 * @property {string} [stream]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Subject
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Assessment
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} subjectId
 * @property {string} classId
 * @property {number} duration
 * @property {number} totalMarks
 * @property {number} passMarks
 * @property {'DRAFT' | 'PUBLISHED' | 'ARCHIVED'} status
 * @property {boolean} showResults
 * @property {string} [startTime]
 * @property {string} [endTime]
 * @property {string} [instructions]
 * @property {Subject} subject
 * @property {SchoolClass} class
 * @property {Question[]} [questions]
 * @property {AttemptStatus} [attemptStatus]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} assessmentId
 * @property {string} questionText
 * @property {'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK'} questionType
 * @property {string[]} [options]
 * @property {string} correctAnswer
 * @property {number} marks
 * @property {string} [explanation]
 * @property {number} orderIndex
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Attempt
 * @property {string} id
 * @property {string} studentId
 * @property {string} assessmentId
 * @property {string} startedAt
 * @property {string} [submittedAt]
 * @property {'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'} status
 * @property {number} totalScore
 * @property {number} percentage
 * @property {number} [timeSpent]
 * @property {Student} student
 * @property {Assessment} assessment
 * @property {Answer[]} [answers]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Answer
 * @property {string} id
 * @property {string} attemptId
 * @property {string} questionId
 * @property {string} answer
 * @property {boolean} isCorrect
 * @property {number} marksAwarded
 * @property {Question} question
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AttemptStatus
 * @property {boolean} hasAttempted
 * @property {'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | null} status
 * @property {number | null} score
 * @property {number | null} percentage
 * @property {string | null} submittedAt
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {string} [error]
 * @property {any} [data]
 * @property {Object} [pagination]
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} CreateStudentData
 * @property {string} email
 * @property {string} password
 * @property {string} studentId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} classId
 */

/**
 * @typedef {Object} CreateAssessmentData
 * @property {string} title
 * @property {string} [description]
 * @property {string} subjectId
 * @property {string} classId
 * @property {number} duration
 * @property {number} passMarks
 * @property {string} [startTime]
 * @property {string} [endTime]
 * @property {string} [instructions]
 * @property {boolean} [showResults]
 */

/**
 * @typedef {Object} CreateQuestionData
 * @property {string} questionText
 * @property {'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK'} questionType
 * @property {string[]} [options]
 * @property {string} correctAnswer
 * @property {number} [marks]
 * @property {string} [explanation]
 * @property {number} orderIndex
 */

export {};