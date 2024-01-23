"use strict";

const db = require("../db.js");
const Job = require("../models/job.js");

const {
  jobBeforeAll,
  jobBeforeEach,
  jobAfterEach,
  jobAfterAll,
} = require("../models/_testJob");

beforeAll(jobBeforeAll);
beforeEach(jobBeforeEach);
afterEach(jobAfterEach);
afterAll(jobAfterAll);

/************************************** Job.create() */

describe("update columns", function () {
  test("fails: cannot update companyHandle", async function () {
    try {
      const newJob = {
        title: "Dev Level 10",
        salary: 155310,
        equity: 0.92,
        companyHandle: "c3",
      };
      const job = await Job.create(newJob);

      const newData = {
        companyHandle: "c2",
      };

      const querySql =
        "UPDATE jobs SET company_handle=$1 WHERE id =$2 RETURNING *";

      await db.query(querySql, [newData.companyHandle, job.id]);
      fail();
    } catch (err) {
      expect(err.message).toMatch(
        /Updating company_handle in jobs table is not allowed/
      );
    }
  });

  test("fails: cannot update id", async function () {
    try {
      const newJob = {
        title: "Dev Level 10",
        salary: 155310,
        equity: 0.92,
        companyHandle: "c3",
      };
      const job = await Job.create(newJob);

      const newData = {
        id: 999,
      };

      const querySql = "UPDATE jobs SET id=$1 WHERE id =$2 RETURNING *";

      await db.query(querySql, [newData.id, job.id]);

      fail();
    } catch (err) {
      expect(err.message).toMatch(/Updating id in jobs table is not allowed/);
    }
  });
});
