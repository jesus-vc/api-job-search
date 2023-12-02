const Joi = require("joi");

const schemaCompanyFilters = Joi.object({
  minEmployees: Joi.number().integer(),
  maxEmployees: Joi.number().integer(),
  name: Joi.string(),
});

module.exports = schemaCompanyFilters;
