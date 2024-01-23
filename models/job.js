"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  buildPartialUpdateQuery,
  buildJobFilteredQuery,
} = require("../helpers/sqlBuilders");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns {id, title, salary, equity, companyHandle }
   *
   * Duplicate jobs are allowed for the same company.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity,company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );

    const job = result.rows[0];

    return job;
  }
  /** Find all jobs.
   *
   * Returns [{id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      ORDER BY title`
    );
    return result.rows;
  }

  /** Find all jobs given query strings
   *
   * Returns jobs given the query strings [jobs: { id, title, salary, equity, companyHandle  }, ...]
   *
   */

  //PEER how does one visualize all these queries and pieces? Also
  // Would it be cleaner to incorporate hasEquity = false into the query to reduce conditionals?

  static async findByFilters(filters) {
    /** handle hasEquity filter
     * If 'hasEquity = true' -> filter for jobs that provide a non-zero amount of equity.
     */

    filters.hasEquity === "true"
      ? (filters.hasEquity = 0)
      : delete filters.hasEquity;

    /** if 'hasEquity = false' was the only filter, return all jobs  */
    if (Object.keys(filters).length === 0) {
      const jobsRes = await Job.findAll();
      return jobsRes;
    } else {
      const { whereStatement, values } = buildJobFilteredQuery(filters, {
        title: "title" + " ILIKE ",
        minSalary: "salary" + ">=",
        hasEquity: "equity" + ">",
      });
      const querySql = `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             ${whereStatement}`;
      const jobsRes = await db.query(querySql, [...values]);
      return jobsRes.rows;
    }
  }

  /** Given a job id, return data about id.
   *
   * Returns {id, title, salary, equity, companyHandle }
   * where companyHandle is { handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const result = await db.query(
      `SELECT j.id, j.title, j.salary, j.equity, c.handle, c.name, c.description, c.num_employees, c.logo_url
      FROM jobs AS j
      JOIN companies AS c ON j.company_handle = c.handle
      WHERE id=$1`,
      [id]
    );

    const j = result.rows[0];
    if (!j) throw new NotFoundError(`No job: ${id}`);

    return {
      id: j.id,
      title: j.title,
      salary: j.salary,
      equity: j.equity,
      companyHandle: {
        handle: j.handle,
        name: j.name,
        description: j.description,
        numEmployees: j.num_employees,
        loglUrl: j.logo_url,
      },
    };
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * A job's companyHandle cannot be updated.
   *
   * Data can include: {title, salary, equity}.
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = buildPartialUpdateQuery(data, {});

    const handleIDIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
    SET ${setCols}
    WHERE id = ${handleIDIdx}
    RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

    const result = await db.query(querySql, [...values, id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with ${id} id`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
    WHERE id = $1
    RETURNING id`,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with ${id} id.`);
  }
}

module.exports = Job;
