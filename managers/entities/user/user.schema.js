const Joi = require('joi')

module.exports = {
  create: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .required()
      .label('Username')
      .messages({
        'string.min': 'Username must be between 3 and 50 characters.',
        'string.max': 'Username must be between 3 and 50 characters.',
        'any.required': 'Username is required.',
      }),
    email: Joi.string().email().required().label('Email Address').messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email Address is required.',
    }),
    password: Joi.string().min(6).required().label('Password').messages({
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is required.',
    }),
    role: Joi.string()
      .valid('superadmin', 'school_admin', 'student')
      .default('student')
      .optional()
      .label('User Role')
      .messages({
        'any.only':
          'Role must be one of: superadmin, school_admin, or student.',
      }),
    schoolId: Joi.string()
      .min(10)
      .max(100)
      .optional()
      .label('School ID')
      .messages({
        'string.min': 'School ID must be between 10 and 100 characters.',
        'string.max': 'School ID must be between 10 and 100 characters.',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().label('Email Address').messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email Address is required.',
    }),
    password: Joi.string().min(6).required().label('Password').messages({
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is required.',
    }),
  }),

  update: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .optional()
      .label('Username')
      .messages({
        'string.min': 'Username must be between 3 and 50 characters.',
        'string.max': 'Username must be between 3 and 50 characters.',
      }),
    email: Joi.string().email().optional().label('Email Address').messages({
      'string.email': 'Please provide a valid email address.',
    }),
    password: Joi.string().min(6).optional().label('Password').messages({
      'string.min': 'Password must be at least 6 characters long.',
    }),
    role: Joi.string()
      .valid('superadmin', 'school_admin', 'student')
      .optional()
      .label('User Role')
      .messages({
        'any.only':
          'Role must be one of: superadmin, school_admin, or student.',
      }),
    schoolId: Joi.string()
      .min(10)
      .max(100)
      .optional()
      .label('School ID')
      .messages({
        'string.min': 'School ID must be between 10 and 100 characters.',
        'string.max': 'School ID must be between 10 and 100 characters.',
      }),
  }),
}
