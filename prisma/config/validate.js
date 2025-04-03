const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

module.exports = {
  registerSchema: Joi.object({
    email: Joi.string().email().required(),
    password: passwordSchema.required(),
    username: Joi.string().min(3).max(30).required()
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};