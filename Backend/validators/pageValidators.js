const Joi = require("joi");

exports.pageSchema = Joi.object({
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
  slug: Joi.string().trim().optional(),
  section: Joi.string().valid("landing", "legal", "other").optional(),
  subSection: Joi.string()
    .valid("privacy", "terms", "about", "contact", "cookie", "support", "other")
    .optional(),
  status: Joi.string().valid("draft", "published").optional(),
  metadata: Joi.object().optional(),
});

exports.pageUpdateSchema = Joi.object({
  title: Joi.string().trim().optional(),
  content: Joi.string().trim().optional(),
  slug: Joi.string().trim().optional(),
  section: Joi.string().valid("landing", "legal", "other").optional(),
  subSection: Joi.string()
    .valid("privacy", "terms", "about", "contact", "cookie", "support", "other")
    .optional(),
  status: Joi.string().valid("draft", "published").optional(),
  metadata: Joi.object().optional(),
});
