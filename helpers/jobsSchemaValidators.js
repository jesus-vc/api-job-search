const { BadRequestError } = require("../expressError");

const {
  jobsIdParamSchema,
  jobsFilteredQuerySchema,
  jobsPatchSchema,
  jobsPostSchema,
} = require("../schemas/jobsValidationSchemas");

/**
 * Validates schema for GET /jobs containing filters, and the validates logic when necessary.
 */
function validateJobsGetRequest(filters) {
  const { error, value } = jobsFilteredQuerySchema.validate(filters);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for /jobs requests containing :id arguments.
 */
function validateJobsIdParam(reqId) {
  const { error, value } = jobsIdParamSchema.validate(reqId);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for POST /jobs, and the validates logic when necessary.
 */

function validateJobsPostRequest(reqBody) {
  const { error, value } = jobsPostSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for PATCH /jobs, and the validates logic when necessary.
 */

function validateJobsPatchRequest(reqBody) {
  const { error, value } = jobsPatchSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

module.exports = {
  validateJobsGetRequest,
  validateJobsPostRequest,
  validateJobsPatchRequest,
  validateJobsIdParam,
};
