const Joi = require("joi");

const jobsFilteredQuerySchema = Joi.object({
  title: Joi.string(),
  minSalary: Joi.number().integer().min(0),
  hasEquity: Joi.string(),
});

const jobsIdParamSchema = Joi.object({
  id: Joi.number().required(),
});

const jobsPatchSchema = Joi.object({
  title: Joi.string(),
  minSalary: Joi.number().integer().min(0),
  equity: Joi.string().max(1.0),
});

const jobsPostSchema = Joi.object({
  title: Joi.string().required(),
  salary: Joi.number().integer().min(0),
  equity: Joi.number().max(1.0),
  companyHandle: Joi.string().required(),
});

module.exports = {
  jobsIdParamSchema,
  jobsFilteredQuerySchema,
  jobsPatchSchema,
  jobsPostSchema,
};
