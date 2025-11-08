const Joi = require('joi');

// Custom validation helpers
const customValidators = {
  // Nigerian phone number validation
  nigerianPhone: (value, helpers) => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(value)) {
      return helpers.error('custom.invalidNigerianPhone');
    }
    return value;
  },
  
  // Student ID validation (alphanumeric, 3-20 characters)
  studentId: (value, helpers) => {
    const studentIdRegex = /^[A-Za-z0-9]{3,20}$/;
    if (!studentIdRegex.test(value)) {
      return helpers.error('custom.invalidStudentId');
    }
    return value;
  },
  
  // Assessment time validation (future date only)
  futureDate: (value, helpers) => {
    if (new Date(value) <= new Date()) {
      return helpers.error('custom.mustBeFutureDate');
    }
    return value;
  },
  
  // Password strength validation
  strongPassword: (value, helpers) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    if (!isLongEnough) {
      return helpers.error('custom.passwordTooShort');
    }
    
    const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (strengthCount < 3) {
      return helpers.error('custom.passwordTooWeak');
    }
    
    return value;
  }
};

// Extend Joi with custom validators
const extendedJoi = Joi.extend({
  type: 'custom',
  base: Joi.string(),
  messages: {
    'custom.invalidNigerianPhone': 'Must be a valid Nigerian phone number (+234xxxxxxxxxx or 0xxxxxxxxxx)',
    'custom.invalidStudentId': 'Student ID must be 3-20 alphanumeric characters',
    'custom.mustBeFutureDate': 'Date must be in the future',
    'custom.passwordTooShort': 'Password must be at least 8 characters long',
    'custom.passwordTooWeak': 'Password must contain at least 3 of: uppercase, lowercase, number, special character'
  },
  rules: {
    nigerianPhone: {
      method: customValidators.nigerianPhone
    },
    studentId: {
      method: customValidators.studentId
    },
    futureDate: {
      method: customValidators.futureDate
    },
    strongPassword: {
      method: customValidators.strongPassword
    }
  }
});

// Common validation schemas
const validationSchemas = {
  // Authentication schemas
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),
  
  register: Joi.object({
    email: Joi.string().email().required(),
    password: extendedJoi.custom().strongPassword().required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    })
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: extendedJoi.custom().strongPassword().required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),
  
  // Student schemas
  createStudent: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    studentId: extendedJoi.custom().studentId().required(),
    firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).required().messages({
      'string.pattern.base': 'First name should only contain letters and spaces'
    }),
    lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).required().messages({
      'string.pattern.base': 'Last name should only contain letters and spaces'
    }),
    classId: Joi.string().required(),
    phone: extendedJoi.custom().nigerianPhone().optional()
  }),
  
  updateStudent: Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).optional(),
    lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).optional(),
    classId: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    phone: extendedJoi.custom().nigerianPhone().optional().allow('')
  }),
  
  // Assessment schemas
  createAssessment: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional().allow(''),
    subjectId: Joi.string().required(),
    classId: Joi.string().required(),
    duration: Joi.number().integer().min(5).max(480).required().messages({
      'number.min': 'Assessment duration must be at least 5 minutes',
      'number.max': 'Assessment duration cannot exceed 8 hours'
    }),
    passMarks: Joi.number().integer().min(0).required(),
    totalMarks: Joi.number().integer().min(1).optional(),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().min(Joi.ref('startTime')).optional().messages({
      'date.min': 'End time must be after start time'
    }),
    instructions: Joi.string().max(2000).optional().allow(''),
    showResults: Joi.boolean().default(false)
  }).custom((value, helpers) => {
    // Custom validation for pass marks vs total marks
    if (value.totalMarks && value.passMarks > value.totalMarks) {
      return helpers.error('custom.passMarksExceedsTotal');
    }
    return value;
  }).messages({
    'custom.passMarksExceedsTotal': 'Pass marks cannot exceed total marks'
  }),
  
  updateAssessment: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional().allow(''),
    duration: Joi.number().integer().min(5).max(480).optional(),
    passMarks: Joi.number().integer().min(0).optional(),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    instructions: Joi.string().max(2000).optional().allow(''),
    showResults: Joi.boolean().optional()
  }),
  
  // Question schemas
  createQuestion: Joi.object({
    questionText: Joi.string().min(10).max(1000).required(),
    questionType: Joi.string().valid('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK').required(),
    options: Joi.when('questionType', {
      is: 'MULTIPLE_CHOICE',
      then: Joi.array().items(Joi.string().min(1)).min(2).max(6).required(),
      otherwise: Joi.optional()
    }),
    correctAnswer: Joi.string().min(1).max(200).required(),
    marks: Joi.number().integer().min(1).max(100).default(1),
    explanation: Joi.string().max(500).optional().allow(''),
    orderIndex: Joi.number().integer().min(1).required()
  }),
  
  bulkCreateQuestions: Joi.object({
    questions: Joi.array().items(
      Joi.object({
        questionText: Joi.string().min(10).max(1000).required(),
        questionType: Joi.string().valid('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK').required(),
        options: Joi.when('questionType', {
          is: 'MULTIPLE_CHOICE',
          then: Joi.array().items(Joi.string().min(1)).min(2).max(6).required(),
          otherwise: Joi.optional()
        }),
        correctAnswer: Joi.string().min(1).max(200).required(),
        marks: Joi.number().integer().min(1).max(100).default(1),
        explanation: Joi.string().max(500).optional().allow('')
      })
    ).min(1).max(100).required().messages({
      'array.min': 'At least one question is required',
      'array.max': 'Maximum 100 questions allowed per upload'
    })
  }),
  
  // Answer submission
  submitAnswer: Joi.object({
    questionId: Joi.string().required(),
    answer: Joi.string().max(500).required().messages({
      'string.max': 'Answer cannot exceed 500 characters'
    })
  }),
  
  // Class and subject schemas
  createClass: Joi.object({
    name: Joi.string().min(2).max(50).pattern(/^[A-Za-z0-9\s]+$/).required().messages({
      'string.pattern.base': 'Class name should only contain letters, numbers and spaces'
    }),
    stream: Joi.string().min(2).max(30).optional().allow('')
  }),
  
  createSubject: Joi.object({
    name: Joi.string().min(2).max(100).required()
  }),
  
  assignSubjectToClass: Joi.object({
    classId: Joi.string().required(),
    subjectId: Joi.string().required()
  }),
  
  // Query parameter validation
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional()
  }),
  
  assessmentQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
    classId: Joi.string().optional(),
    subjectId: Joi.string().optional(),
    search: Joi.string().max(100).optional()
  })
};

// Validation middleware factory
const createValidationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : 
                          source === 'params' ? req.params : 
                          req.body;
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: source === 'query', // Allow unknown query params
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Replace original data with validated data
    if (source === 'query') req.query = value;
    else if (source === 'params') req.params = value;
    else req.body = value;
    
    next();
  };
};

// Specific validation middlewares
const validationMiddlewares = {
  // Auth
  validateLogin: createValidationMiddleware(validationSchemas.login),
  validateRegister: createValidationMiddleware(validationSchemas.register),
  validateChangePassword: createValidationMiddleware(validationSchemas.changePassword),
  
  // Students
  validateCreateStudent: createValidationMiddleware(validationSchemas.createStudent),
  validateUpdateStudent: createValidationMiddleware(validationSchemas.updateStudent),
  
  // Assessments
  validateCreateAssessment: createValidationMiddleware(validationSchemas.createAssessment),
  validateUpdateAssessment: createValidationMiddleware(validationSchemas.updateAssessment),
  
  // Questions
  validateCreateQuestion: createValidationMiddleware(validationSchemas.createQuestion),
  validateBulkCreateQuestions: createValidationMiddleware(validationSchemas.bulkCreateQuestions),
  validateSubmitAnswer: createValidationMiddleware(validationSchemas.submitAnswer),
  
  // Others
  validateCreateClass: createValidationMiddleware(validationSchemas.createClass),
  validateCreateSubject: createValidationMiddleware(validationSchemas.createSubject),
  validateAssignSubject: createValidationMiddleware(validationSchemas.assignSubjectToClass),
  
  // Query validation
  validatePaginationQuery: createValidationMiddleware(validationSchemas.paginationQuery, 'query'),
  validateAssessmentQuery: createValidationMiddleware(validationSchemas.assessmentQuery, 'query')
};

// Utility functions
const validateEmail = (email) => {
  const { error } = Joi.string().email().validate(email);
  return !error;
};

const validateStudentId = (studentId) => {
  const { error } = extendedJoi.custom().studentId().validate(studentId);
  return !error;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

module.exports = {
  validationSchemas,
  validationMiddlewares,
  createValidationMiddleware,
  validateEmail,
  validateStudentId,
  sanitizeString,
  sanitizeObject,
  extendedJoi
};