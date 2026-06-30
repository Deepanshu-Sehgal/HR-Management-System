const Joi = require('joi');

exports.announcementSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  audience: Joi.string().trim().optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  department: Joi.string().trim().optional(),
  active: Joi.boolean().optional(),
});
