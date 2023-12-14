"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  buildPartialUpdateQuery,
  buildCompanyFilteredQuery,
} = require("../helpers/sqlBuilders");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Find all companies given query strings
   *
   * Returns companies given the query strings [{ handle, name, description, numEmployees, logoUrl }, ...]
   *
   * Example of filters argument: { name: "wel", minEmployees: 2, maxEmployees: 3 };
   */

  static async findByFilters(filters) {
    const { whereStatement, values } = buildCompanyFilteredQuery(filters, {
      name: "name" + " ILIKE ",
      minEmployees: "num_employees" + ">=",
      maxEmployees: "num_employees" + "<=",
    });

    const querySql = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ${whereStatement}`;

    const companiesRes = await db.query(querySql, [...values]);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT
        c.handle,
        c.name,
        c.description,
        c.num_employees AS "numEmployees",
        c.logo_url AS "logoUrl",
       CASE 
        WHEN
          COUNT(j.id) > 0
        THEN
          jsonb_agg(jsonb_build_object(
            'id', j.id,
            'title', j.title,
            'salary', j.salary,
            'equity', j.equity::text
            )) 
        ELSE '[]'::jsonb
        END AS "jobs"
      FROM
        companies AS c
      LEFT JOIN
        jobs AS j ON c.handle = j.company_handle
      WHERE
        c.handle = $1
      GROUP BY
        c.handle, c.name, c.description, c.num_employees, c.logo_url`,
      [handle]
    );

    const companies = companyRes.rows[0];

    if (!companies) throw new NotFoundError(`No company: ${handle}`);

    return companies;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = buildPartialUpdateQuery(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
