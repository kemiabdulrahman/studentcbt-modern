const { validationResult } = require('express-validator');
const Joi = require('joi');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Joi Schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  createStudent: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    studentId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    classId: Joi.string().required()
  }),

  createAssessment: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    subjectId: Joi.string().required(),
    classId: Joi.string().required(),
    duration: Joi.number().min(1).required(),
    passMarks: Joi.number().min(0).required(),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    instructions: Joi.string().allow(''),
    showResults: Joi.boolean().default(false)
  }),

  createQuestion: Joi.object({
    questionText: Joi.string().required(),
    questionType: Joi.string().valid('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK').required(),
    options: Joi.when('questionType', {
      is: 'MULTIPLE_CHOICE',
      then: Joi.array().items(Joi.string()).min(2).required(),
      otherwise: Joi.optional()
    }),
    correctAnswer: Joi.string().required(),
    marks: Joi.number().min(1).default(1),
    explanation: Joi.string().allow(''),
    orderIndex: Joi.number().required()
  }),

  submitAnswer: Joi.object({
    questionId: Joi.string().required(),
    answer: Joi.string().required()
  }),

  createSubject: Joi.object({
    name: Joi.string().required()
  }),

  createClass: Joi.object({
    name: Joi.string().required(),
    stream: Joi.string().allow('')
  })
};

module.exports = {
  handleValidationErrors,
  validateWithJoi,
  schemas
};