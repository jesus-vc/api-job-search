"use strict";

/** Routes for companies. */
const express = require("express");
const router = new express.Router();

const Company = require("../models/company");
// const { BadRequestError } = require("../expressError");

const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

// const jsonschema = require("jsonschema");
// const companyNewSchema = require("../schemas/companyNew.json");
// const companyUpdateSchema = require("../schemas/companyUpdate.json");
const {
  validateCompaniesGetRequest,
  validateCompaniesPostRequest,
  validateCompaniesPatchRequest,
} = require("../helpers/companiesSchemaValidators");

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: logged in as admin.
 */

router.post(
  "/",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      validateCompaniesPostRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.

      // const validator = jsonschema.validate(req.body, companyNewSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }

      const company = await Company.create(req.body);
      return res.status(201).json({ company });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    //handle for filtered queries
    //PEER This could be placed into a funtion such as "if(requestHasFilters)". But should I only do it once this logic becomes repetitive across the codebase?
    if (Object.keys(req.query).length > 0) {
      // validateCompaniesGetRequest() fn will throw errors if the input schema or logic is invalid.
      //PEER Is it okay to call functions where the error throwing is done externally?
      validateCompaniesGetRequest(req.query);

      const filteredCompanies = await Company.findByFilters(req.query);
      return res.json({ companies: filteredCompanies });
    }
    //PEER Would adding the else{} stmt here make the code more readable?
    const companies = await Company.findAll();
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch(
  "/:handle",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      validateCompaniesPatchRequest(req.body);

      // TODO Will delete the code snippet below once I get feedback on my schema refactoring.
      // const validator = jsonschema.validate(req.body, companyUpdateSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }
      const company = await Company.update(req.params.handle, req.body);
      return res.json({ company });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

//PEER would it be necessary to validate the :handle input here?

router.delete(
  "/:handle",
  ensureLoggedIn,
  ensureIsAdmin,
  async function (req, res, next) {
    try {
      await Company.remove(req.params.handle);
      return res.json({ deleted: req.params.handle });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
