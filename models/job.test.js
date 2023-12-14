"use strict";

const db = require("../db.js");
const Job = require("./job");
const { BadRequestError, NotFoundError } = require("../expressError");

const {
  jobBeforeAll,
  jobBeforeEach,
  jobAfterEach,
  jobAfterAll,
} = require("./_testJob"); /** // PEER I decided to create my own _testJob.js file rather than using the _testCommmon.js file in order to modularize the code,
and to prevent creating unecessary test data from _testCommmon.js. Or should I merge these _testJob and _testCommon files?
*/

beforeAll(jobBeforeAll);
beforeEach(jobBeforeEach);
afterEach(jobAfterEach);
afterAll(jobAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Dev Level 4",
    salary: 155300,
    equity: 0.63,
    companyHandle: "c3",
  };

  test("creates and returns new job with correct data", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Dev Level 4",
      salary: 155300,
      equity: "0.63",
      companyHandle: "c3",
    });

    //PEER is there a need to test the DB directly here? Seems redundant since await Job.create(newJob) returns the data inserted by the DB.
    const result = await db.query(
      `SELECT id,title,salary,equity,company_handle AS "companyHandle"
        FROM jobs
        WHERE id = ${job.id}`
    );
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "Dev Level 4",
        salary: 155300,
        equity: "0.63",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Dev Level 1",
        salary: 120000,
        equity: "0.12",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Dev Level 2",
        salary: 140000,
        equity: "0.442",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Dev Level 3",
        salary: 150000,
        equity: "0.552",
        companyHandle: "c2",
      },
    ]);
  });
});

/************************************** findByFilters */

describe("findByFilters", function () {
  test("works: all filters", async function () {
    const filters = { title: "dev", minSalary: 140000, hasEquity: true };
    const jobs = await Job.findByFilters(filters);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Dev Level 2",
        salary: 140000,
        equity: "0.442",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Dev Level 3",
        salary: 150000,
        equity: "0.552",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: title filter", async function () {
    const filters = { title: "dev" };
    const jobs = await Job.findByFilters(filters);

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Dev Level 1",
        salary: 120000,
        equity: "0.12",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "Dev Level 2",
        salary: 140000,
        equity: "0.442",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "Dev Level 3",
        salary: 150000,
        equity: "0.552",
        companyHandle: "c2",
      },
    ]);
  });
  test("works: filter by no equity", async function () {
    const filters = { title: "c" };
    const jobs = await Job.findByFilters(filters);
    expect(jobs).toEqual([]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const newJob = {
      title: "Dev Level 6",
      salary: 155300,
      equity: 0.82,
      companyHandle: "c3",
    };
    const job = await Job.create(newJob);

    const jobDetails = await Job.get(job.id);
    expect(jobDetails).toEqual({
      id: job.id,
      title: "Dev Level 6",
      salary: 155300,
      equity: "0.82",
      companyHandle: {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        loglUrl: "http://c3.img",
      },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(33);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  test("works", async function () {
    const newJob = {
      title: "Dev Level 8",
      salary: 155310,
      equity: 0.92,
      companyHandle: "c3",
    };
    const job = await Job.create(newJob);

    const newData = {
      title: "Dev Level 5",
      salary: 145310,
      equity: "0.95",
    };

    const updatedJob = await Job.update(job.id, newData);

    expect(updatedJob).toEqual({
      id: job.id,
      title: "Dev Level 5",
      salary: 145310,
      equity: "0.95",
      companyHandle: "c3",
    });
  });

  test("not found if no such job", async function () {
    try {
      const newData = {
        title: "Dev Level 5",
        salary: 145310,
        equity: 0.95,
      };

      await Job.update(33, newData);
      fail();
    } catch (err) {
      //PEER Is this method of testing the error used in production environments? Compare it to test("fails: fails: invalid input parameters keys") in companies.test.js
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    //PEER for each test, is it best to create a newjob as I did here or capture into variables the results of the _testJobs.js?
    const newJob = {
      title: "Dev Level 5",
      salary: 155300,
      equity: 0.63,
      companyHandle: "c3",
    };

    const job = await Job.create(newJob);

    await Job.remove(job.id);

    const res = await db.query(`SELECT id FROM jobs WHERE id=${job.id}`);

    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      const result = await Job.remove(95);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
