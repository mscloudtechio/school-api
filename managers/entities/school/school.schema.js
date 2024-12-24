const Joi = require('joi')

module.exports = {
  create: Joi.object({
    id: Joi.string().min(3).max(100).required(),
    name: Joi.string().min(3).max(100).required(),
    address: Joi.string().min(10).max(200).required(),
  }),
}
