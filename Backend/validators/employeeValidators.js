const Joi = require('joi');

exports.createEmployeeSchema = Joi.object({
  employeeName: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email().required(),
  phoneNumber: Joi.string().trim().min(7).required(),
  department: Joi.string().trim().required(),
  position: Joi.string().trim().required(),
  experience: Joi.number().min(0).required(),
  date: Joi.date().iso().required(),
});

exports.updateEmployeeSchema = Joi.object({
  employeeName: Joi.string().trim().min(2),
  email: Joi.string().trim().email(),
  phoneNumber: Joi.string().trim().min(7),
  department: Joi.string().trim(),
  position: Joi.string().trim(),
  experience: Joi.number().min(0),
  date: Joi.date().iso(),
}).min(1);
