const { BadRequestError } = require("../expressError");

const { jobsFilteredQuerySchema } = require("../schemas/jobsValidationSchemas");

const {
  companiesFilteredQuerySchema,
} = require("../schemas/companiesValidationSchemas");

//PEER Below is my comment for buildPartialUpdateQuery().
// Can you compare this comment with the comment for buildJobFilteredQuery() below? Which comment structure is better?
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

//PEER I renamed sqlForPartialUpdate to buildPartialUpdateQuery to make it consistent with similar functions. Can you think of a better naming convention?
function buildPartialUpdateQuery(dataToUpdate, jsToSql) {
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
 * For Job table, builds parameters for a filtered SQL query based on input filters and mapping.
 *
 * @param {Object} filters - The filters object containing SQL input.
 * @param {Object} jsToSql - The jsToSql object for mapping JavaScript to SQL.
 * @returns {Object} - Returns an object with properties for constructing a SQL query.
 *                   - whereStatement: The WHERE clause of the SQL query.
 *                   - values: Modified values for the query.
 */

function buildJobFilteredQuery(filters, jsToSql) {
  const filterKeys = Object.keys(filters);

  const cols = filterKeys.map(
    (colName, idx) => `${jsToSql[colName] || colName}$${idx + 1}`
  );

  //PEER which version of 'modifiedValues' below is more readable? Version 1 or 2?

  // Version 1

  // const modifiedValues = Object.values(filters).map((v, idx) => {
  //   if (
  //     jobFilteredQuerySchema._ids._byKey.get(`${filterKeys[idx]}`).schema
  //       .type === "string"
  //   ) {
  //     return `%${v}%`;
  //   } else return v;
  // });

  // Version 2

  // { name: "wel", minEmployees: 2, maxEmployees: 3 } => [ '%wel%', 2, 3 ]
  const modifiedValues = Object.values(filters).map((v, idx) =>
    jobsFilteredQuerySchema._ids._byKey.get(`${filterKeys[idx]}`).schema
      .type === "string" && filterKeys[idx] !== "hasEquity"
      ? `%${v}%`
      : v
  );

  return {
    whereStatement: "WHERE " + cols.join(" AND "),
    values: modifiedValues,
  };
}

/**
 * For Company table, builds parameters for a filtered SQL query based on input filters and mapping.
 *
 * @param {Object} filters - The filters object containing SQL input.
 * @param {Object} jsToSql - The jsToSql object for mapping JavaScript to SQL.
 * @returns {Object} - Returns an object with properties for constructing a SQL query.
 *                   - whereStatement: The WHERE clause of the SQL query.
 *                   - values: Modified values for the query.
 */

function buildCompanyFilteredQuery(filters, jsToSql) {
  const filterKeys = Object.keys(filters);

  const cols = filterKeys.map(
    (colName, idx) => `${jsToSql[colName] || colName}$${idx + 1}`
  );

  // { name: "wel", minEmployees: 2, maxEmployees: 3 } => [ '%wel%', 2, 3 ]
  const modifiedValues = Object.values(filters).map((v, idx) =>
    companiesFilteredQuerySchema._ids._byKey.get(`${filterKeys[idx]}`).schema
      .type === "string"
      ? `%${v}%`
      : v
  );

  return {
    whereStatement: "WHERE " + cols.join(" AND "),
    values: modifiedValues,
  };
}

module.exports = {
  buildPartialUpdateQuery,
  buildJobFilteredQuery,
  buildCompanyFilteredQuery,
};
