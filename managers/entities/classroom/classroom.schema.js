const Joi = require('joi')

module.exports = {
  create: Joi.object({
    schoolId: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    capacity: Joi.number().min(1).max(40).required(),
    resources: Joi.object().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    capacity: Joi.number().min(1).max(500).optional(),
    resources: Joi.object().optional(),
  }),

  list: Joi.object({
    schoolId: Joi.string().required(),
  }),
}
