const Joi = require('joi');

exports.leaveSchema = Joi.object({
  name: Joi.string().trim().required(),
  department: Joi.string().trim().required(),
  leavedate1: Joi.date().iso().required(),
  leavedate2: Joi.date().iso().required(),
  reason: Joi.string().trim().required(),
});

exports.leaveUpdateSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Approved', 'Rejected').optional(),
  reason: Joi.string().trim().optional(),
}).min(1);
