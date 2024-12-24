const Joi = require('joi')

module.exports = {
  create: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required()
      .label('Student Name')
      .messages({
        'string.min': 'Name must be between 3 and 50 characters.',
        'string.max': 'Name must be between 3 and 50 characters.',
        'any.required': 'Name is required.',
      }),
    age: Joi.number().min(5).max(100).required().label('Student Age').messages({
      'number.min': 'Age must be between 5 and 100 years.',
      'number.max': 'Age must be between 5 and 100 years.',
      'any.required': 'Age is required.',
    }),
    grade: Joi.string().min(1).max(10).required().label('Grade').messages({
      'string.min': 'Grade must be between 1 and 10 characters.',
      'string.max': 'Grade must be between 1 and 10 characters.',
      'any.required': 'Grade is required.',
    }),
    schoolId: Joi.string()
      .min(10)
      .max(100)
      .required()
      .label('School ID')
      .messages({
        'string.min': 'School ID must be valid.',
        'string.max': 'School ID must be valid.',
        'any.required': 'School ID is required.',
      }),
    classId: Joi.string()
      .min(10)
      .max(100)
      .required()
      .label('Classroom ID')
      .messages({
        'string.min': 'Classroom ID must be valid.',
        'string.max': 'Classroom ID must be valid.',
        'any.required': 'Classroom ID is required.',
      }),
    profile: Joi.object().optional().label('Student Profile').messages({
      'object.base': 'Profile must be a valid JSON object.',
    }),
  }),

  update: Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .optional()
      .label('Student Name')
      .messages({
        'string.min': 'Name must be between 3 and 50 characters.',
        'string.max': 'Name must be between 3 and 50 characters.',
      }),
    age: Joi.number().min(5).max(100).optional().label('Student Age').messages({
      'number.min': 'Age must be between 5 and 100 years.',
      'number.max': 'Age must be between 5 and 100 years.',
    }),
    grade: Joi.string().min(1).max(10).optional().label('Grade').messages({
      'string.min': 'Grade must be between 1 and 10 characters.',
      'string.max': 'Grade must be between 1 and 10 characters.',
    }),
    profile: Joi.object().optional().label('Student Profile').messages({
      'object.base': 'Profile must be a valid JSON object.',
    }),
  }),

  delete: Joi.object({
    studentId: Joi.string()
      .min(10)
      .max(100)
      .required()
      .label('Student ID')
      .messages({
        'string.min': 'Student ID must be valid.',
        'string.max': 'Student ID must be valid.',
        'any.required': 'Student ID is required.',
      }),
  }),
}
