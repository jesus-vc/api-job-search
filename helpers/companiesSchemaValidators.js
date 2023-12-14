const { BadRequestError } = require("../expressError");

const {
  companiesFilteredQuerySchema,
  companiesPostSchema,
  companiesPatchSchema,
} = require("../schemas/companiesValidationSchemas");

/**
 * Validates schema for GET /companies containing filtered requests, and the validates logic when necessary.
 */

function validateCompaniesGetRequest(filters) {
  const { error, value } = companiesFilteredQuerySchema.validate(filters);
  if (error) throw new BadRequestError(error.message);

  // logic validation
  if (Number(filters.minEmployees) > Number(filters.maxEmployees))
    throw new BadRequestError(
      "minEmployees cannot be greater than maxEmployees"
    );
}

/**
 * Validates schema for POST /companies, and the validates logic when necessary.
 */

function validateCompaniesPostRequest(reqBody) {
  const { error, value } = companiesPostSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for PATCH /companies, and the validates logic when necessary.
 */

function validateCompaniesPatchRequest(reqBody) {
  const { error, value } = companiesPatchSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

module.exports = {
  validateCompaniesGetRequest,
  validateCompaniesPostRequest,
  validateCompaniesPatchRequest,
};
