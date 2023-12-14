//PEER What comments here would be useful, given the variables below are fairly straightforward (at least I think)?

const Joi = require("joi");

const companiesFilteredQuerySchema = Joi.object({
  minEmployees: Joi.number().integer(),
  maxEmployees: Joi.number().integer(),
  name: Joi.string(),
});

const companiesPostSchema = Joi.object({
  name: Joi.string().min(1).max(30).required(),
  handle: Joi.string().min(1).max(10).required(),
  description: Joi.string().required(),
  numEmployees: Joi.number().integer().min(0),
  logoUrl: Joi.string().uri(),
});

const companiesPatchSchema = Joi.object({
  name: Joi.string().min(1).max(30),
  description: Joi.string(),
  numEmployees: Joi.number().integer().min(0),
  logoUrl: Joi.string().uri(),
});

module.exports = {
  companiesFilteredQuerySchema,
  companiesPatchSchema,
  companiesPostSchema,
};
