const { BadRequestError } = require("../expressError");

const {
  usersAuthSchema,
  usersRegisterSchema,
} = require("../schemas/usersValidationSchemas");

/**
 * Validates schema for POST /auth/token, and the validates logic when necessary.
 */

function validateUsersAuthRequest(reqBody) {
  const { error, value } = usersAuthSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

/**
 * Validates schema for POST /auth/register, and the validates logic when necessary.
 */
function validateUsersRegisterRequest(reqBody) {
  const { error, value } = usersRegisterSchema.validate(reqBody);
  if (error) throw new BadRequestError(error.message);
}

module.exports = {
  validateUsersAuthRequest,
  validateUsersRegisterRequest,
};
