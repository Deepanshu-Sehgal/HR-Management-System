const Joi = require('joi');

exports.jobOpeningSchema = Joi.object({
  jobTitle: Joi.string().trim().min(3).required(),
  department: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  responsibilities: Joi.array().items(Joi.string().trim().required()).min(1).required(),
  qualifications: Joi.array().items(Joi.string().trim().required()).min(1).required(),
  requiredSkills: Joi.array().items(Joi.string().trim().required()).min(1).required(),
  salaryRange: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(Joi.ref("min")).required(),
  }).required(),
  jobType: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  experience: Joi.string().trim().required(),
  numberOfPositions: Joi.number().integer().min(1).required(),
});

exports.jobOpeningUpdateSchema = Joi.object({
  jobTitle: Joi.string().trim().min(3),
  department: Joi.string().trim(),
  description: Joi.string().trim(),
  responsibilities: Joi.array().items(Joi.string().trim().required()).min(1),
  qualifications: Joi.array().items(Joi.string().trim().required()).min(1),
  requiredSkills: Joi.array().items(Joi.string().trim().required()).min(1),
  salaryRange: Joi.string().trim(),
  jobType: Joi.string().trim(),
  location: Joi.string().trim(),
  experience: Joi.string().trim(),
  numberOfPositions: Joi.number().integer().min(1),
}).min(1);
