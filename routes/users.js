"use strict";

/** Routes for users. */

const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const {
  ensureLoggedIn,
  ensureIsAdmin,
  ensureCorrectUser,
} = require("../middleware/auth");

const {
  validateUsersPostRequest,
  validateUsersPatchRequest,
} = require("../helpers/usersSchemaValidators");
const { validateJobsIdParam } = require("../helpers/jobsSchemaValidators");

//TODO delete commented out vars below once I get peer feedback on schema refactoring.
// const jsonschema = require("jsonschema");
// const { BadRequestError } = require("../expressError");
// const userNewSchema = require("../schemas/userNew.json");
// const userUpdateSchema = require("../schemas/userUpdate.json");

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post(
  "/",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      validateUsersPostRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const validator = jsonschema.validate(req.body, userNewSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }

      const user = await User.register(req.body);
      const token = createToken(user);
      return res.status(201).json({ user, token });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /:username/jobs/:id  => { applied: jobId }
 *
 * Submits job application for a user.
 *
 * This returns the jobId of the job application.
 *
 * Authorization required: Logged in user must be admin or match the :username value.
 **/

router.post(
  "/:username/jobs/:id",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      //validate schema of :id param value
      validateJobsIdParam({
        id: Number(req.params.id),
      });

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const { error, value } = jobGetByIDSchema.validate({
      //   id: Number(req.params.id),
      // });
      // if (error) throw new BadRequestError(error.message);

      //Job.get() throws error if job id doesn't exist
      await Job.get(req.params.id); //PEER Notice here that I'm calling the Job model directly. Would it be best practice to call the Job route instead

      const applyRequest = await User.applyForJob(
        req.params.username,
        req.params.id
      );

      return res.status(201).json({ applied: applyRequest.jobId });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: Logged in user must be admin or match the :username value.
 **/

router.get(
  "/:username",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch(
  "/:username",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      validateUsersPatchRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const validator = jsonschema.validate(req.body, userUpdateSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete(
  "/:username",
  ensureLoggedIn,
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
