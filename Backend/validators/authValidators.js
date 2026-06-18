const Joi = require('joi');

exports.registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Valid email required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
  }),
});

exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Valid email required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});
