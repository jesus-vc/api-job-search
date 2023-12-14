const { BadRequestError } = require("../expressError");

const {
  usersPostSchema,
  usersPatchSchema,
} = require("../schemas/usersValidationSchemas");

/**
 * Validates schema for POST /users, and the validates logic when necessary.
 */

function validateUsersPostRequest(reqBody) {
  const { error, value } = usersPostSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for PATCH /users, and the validates logic when necessary.
 */
function validateUsersPatchRequest(reqBody) {
  const { error, value } = usersPatchSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

module.exports = {
  validateUsersPostRequest,
  validateUsersPatchRequest,
};
