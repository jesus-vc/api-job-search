"use strict";

/** Routes for authentication. */
const express = require("express");
const router = new express.Router();

const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
//TODO delete commented out vars below once I get peer feedback on schema refactoring.
// const { BadRequestError } = require("../expressError");
// const jsonschema = require("jsonschema");
// const userAuthSchema = require("../schemas/userAuth.json");
// const userRegisterSchema = require("../schemas/userRegister.json");
const {
  validateUsersAuthRequest,
  validateUsersRegisterRequest,
} = require("../helpers/authSchemaValidators");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    validateUsersAuthRequest(req.body);
    // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
    // const validator = jsonschema.validate(req.body, userAuthSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    validateUsersRegisterRequest(req.body);

    // TODO Will delete the code snippet below once I get feedback on my schema refactoring.

    // const validator = jsonschema.validate(req.body, userRegisterSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
