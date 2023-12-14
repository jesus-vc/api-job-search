const Joi = require("joi");

const usersAuthSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const usersPostSchema = Joi.object({
  username: Joi.string().min(1).max(30).required(),
  password: Joi.string().min(5).max(20).required(),
  firstName: Joi.string().min(1).max(30).required(),
  lastName: Joi.string().min(1).max(30).required(),
  email: Joi.string().email().min(6).max(60).required(),
  isAdmin: Joi.boolean(),
});

const usersRegisterSchema = Joi.object({
  username: Joi.string().min(1).max(30).required(),
  password: Joi.string().min(5).max(20).required(),
  firstName: Joi.string().min(1).max(30).required(),
  lastName: Joi.string().min(1).max(30).required(),
  email: Joi.string().email().min(6).max(60).required(),
});

const usersPatchSchema = Joi.object({
  password: Joi.string().min(5).max(20),
  firstName: Joi.string().min(1).max(30),
  lastName: Joi.string().min(1).max(30),
  email: Joi.string().email().min(6).max(60),
});

module.exports = {
  usersAuthSchema,
  usersPostSchema,
  usersRegisterSchema,
  usersPatchSchema,
};
