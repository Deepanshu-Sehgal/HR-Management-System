const Joi = require("joi");

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, "ObjectId");

const stageSchema = Joi.object({
  key: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  order: Joi.number().integer().min(0).required(),
  category: Joi.string().valid("active", "won", "lost").default("active"),
  color: Joi.string().trim().allow(""),
  automation: Joi.object({
    emailEnabled: Joi.boolean(),
    emailSubject: Joi.string().allow(""),
    emailTemplate: Joi.string().allow(""),
    slaDays: Joi.number().min(0),
    autoAdvanceTo: Joi.string().allow(""),
  }),
});

exports.createPipelineSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  description: Joi.string().allow("").default(""),
  jobOpeningId: Joi.string().trim().allow(null, ""),
  stages: Joi.array().items(stageSchema).min(1),
  isDefault: Joi.boolean(),
  createdBy: Joi.string().allow(""),
});

exports.enrollSchema = Joi.object({
  applicationId: objectId.required(),
  pipelineId: objectId.required(),
  stageKey: Joi.string().trim().allow(null, ""),
  by: Joi.string().allow(""),
  force: Joi.boolean(),
});

exports.moveStageSchema = Joi.object({
  stageKey: Joi.string().trim().required(),
  note: Joi.string().allow("").default(""),
  by: Joi.string().allow(""),
});

exports.addTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  assignedTo: Joi.string().allow("").default(""),
  dueDate: Joi.date().allow(null, ""),
  priority: Joi.string().valid("Low", "Medium", "High").default("Medium"),
  by: Joi.string().allow(""),
});

exports.updateMetaSchema = Joi.object({
  assignedTo: Joi.string().allow(""),
  tags: Joi.array().items(Joi.string().trim().max(40)).max(20),
}).min(1);
