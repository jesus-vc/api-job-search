"use strict";

/** Routes for companies. */

const express = require("express");
const router = new express.Router();

const Job = require("../models/job");
// const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

// const jsonschema = require("jsonschema");
// const jobNewSchema = require("../schemas/jobNew.json");

const {
  validateJobsGetRequest,
  validateJobsPostRequest,
  validateJobsPatchRequest,
  validateJobsIdParam,
} = require("../helpers/jobsSchemaValidators");

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle } but only {title, companyHanle} required
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Duplicate jobs are allowed for the same company.
 *
 * Authorization required: logged in as admin.
 */

router.post(
  "/",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      //PEER I created the validateJobsPostRequest fn to store ALL schema/logic validations for routes in /helpers.
      // I also replaced the 'jsonschema' library with the Joi library to handle validation for all routes.
      // Can you please give me feedback on how I organized all these Joi-based schema validations?
      validateJobsPostRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const validator = jsonschema.validate(req.body, jobNewSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }

      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    //handle for filtered queries
    if (Object.keys(req.query).length > 0) {
      // validateJobsGetRequest() fn will throw errors if the input schema or logic is invalid.
      validateJobsGetRequest(req.query);
      const filteredJobs = await Job.findByFilters(req.query);
      return res.json({ jobs: filteredJobs });
    }
    const jobs = await Job.findAll();
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { Job }
 *
 * Returns {job: { id, title, salary, equity, companyHandle }}
 *   where companyHandle is { handle, name, description, numEmployees, logoUrl}
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    validateJobsIdParam({
      id: Number(req.params.id),
    });

    // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
    // const { error, value } = jobsGetByIDSchema.validate({
    //   id: Number(req.params.id),
    // });
    // if (error) throw new BadRequestError(error.message);

    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /id { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login as an admin
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      validateJobsIdParam({
        id: Number(req.params.id),
      });

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const { error, value } = jobsGetByIDSchema.validate({
      //   id: Number(req.params.id),
      // });
      // if (error) throw new BadRequestError(error.message);

      // if (Number.isNaN(Number(req.params.id)))
      //   throw new BadRequestError("id must be a number");

      validateJobsPatchRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const { error, value } = jobPatchSchema.validate(req.body);
      // if (error) throw new BadRequestError(error.message);

      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (error) {
      return next(error);
    }
  }
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Throws NotFoundError if job not found.
 *
 * Authorization: login as admin
 */

router.delete(
  "/:id",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
