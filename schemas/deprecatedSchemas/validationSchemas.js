// const Joi = require("joi");

// const companyFilteredQuerySchema = Joi.object({
//   minEmployees: Joi.number().integer(),
//   maxEmployees: Joi.number().integer(),
//   name: Joi.string(),
// });

// const companyCreateSchema = Joi.object({
//   name: Joi.string().min(1).max(30).required(),
//   handle: Joi.string().min(1).max(10).required(),
//   description: Joi.string().required(),
//   numEmployees: Joi.number().integer().min(0),
//   logoUrl: Joi.string().uri(),
// });

// const companyUpdateSchema = Joi.object({
//   name: Joi.string().min(1).max(30),
//   description: Joi.string(),
//   numEmployees: Joi.number().integer().min(0),
//   logoUrl: Joi.string().uri(),
// });

// const jobFilteredQuerySchema = Joi.object({
//   title: Joi.string(),
//   minSalary: Joi.number().integer().min(0),
//   hasEquity: Joi.string(),
// });

// const jobGetByIDSchema = Joi.object({
//   id: Joi.number().required(),
// });

// const jobPatchSchema = Joi.object({
//   title: Joi.string(),
//   minSalary: Joi.number().integer().min(0),
//   equity: Joi.string().max(1.0),
// });

// const jobCreateSchema = Joi.object({
//   title: Joi.string().required(),
//   salary: Joi.number().integer().min(0),
//   equity: Joi.number().max(1.0),
//   companyHandle: Joi.string().required(),
// });

// module.exports = {
//   companyFilteredQuerySchema,
//   companyUpdateSchema,
//   companyCreateSchema,
//   jobGetByIDSchema,
//   jobFilteredQuerySchema,
//   jobPatchSchema,
//   jobCreateSchema,
//   userAuthSchema,
//   userCreateSchema,
//   userRegisterSchema,
//   userPatchSchema,
// };
