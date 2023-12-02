const { BadRequestError } = require("../expressError");

const schemaCompanyFilters = require("../schemas/companyGetFiltered");

/**
 * Returns parameter column names (string) and values (array) to perform parameterized queries.
 *
 * The jsToSql argument is used to transform the dataToUpdate object containing requester's query parameters.
 * Thus, the jsToSql should include key-value pairs where its keys map to dataToUpdate's keys and values map to the correct column names in the database.
 * Example of jsToSql arguments:
 *
 * With the correct column names found in the companies table:
 * { numEmployees: "num_employees", logoUrl: "logo_url"}
 *
 * With correct column names found in the users table:
 * { firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"}
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * Builds parameters for a filtered SQL query based on input filters and mapping.
 *
 * @param {Object} filters - The filters object containing SQL input.
 * @param {Object} jsToSql - The jsToSql object for mapping JavaScript to SQL.
 * @returns {Object} - Returns an object with properties for constructing a SQL query.
 *                   - whereStatement: The WHERE clause of the SQL query.
 *                   - values: Modified values for the query.
 */

function buildFilteredQueryParams(filters, jsToSql) {
  const filterKeys = Object.keys(filters);

  const cols = filterKeys.map(
    (colName, idx) => `${jsToSql[colName] || colName}$${idx + 1}`
  );

  // { name: "wel", minEmployees: 2, maxEmployees: 3 } => [ '%wel%', 2, 3 ]
  const modifiedValues = Object.values(filters).map((v) =>
    isNaN(Number(v)) ? `%${v}%` : v
  );

  return {
    whereStatement: "WHERE " + cols.join(" AND "),
    values: modifiedValues,
  };
}

/**
 * Validates SQL Input's schema and logic.

 * @param {Object} filters - The filters object containing SQL input.
 * @throws {BadRequestError} - Throws errors if logic or schema validation fail. This should be caught by the original calling function.
 */

function validateSQLInput(filters) {
  // schema validation
  const { error, value } = schemaCompanyFilters.validate(filters);
  if (error) throw new BadRequestError(error.message);

  // logic validation
  if (parseInt(filters.minEmployees) > parseInt(filters.maxEmployees))
    throw new BadRequestError(
      "minEmployees cannot be greater than maxEmployees"
    );
}

module.exports = {
  sqlForPartialUpdate,
  buildFilteredQueryParams,
  validateSQLInput,
};
