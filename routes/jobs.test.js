"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New",
    salary: 190000,
    equity: 0.112,
    companyHandle: "c1",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New",
        salary: 190000,
        equity: "0.112",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing title", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 190000,
        equity: 0.112,
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with missing companyHandle", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "New",
        salary: 190000,
        equity: 0.112,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        companyHandle: 999,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 0",
          salary: 80000,
          equity: "0",
          companyHandle: "c1",
        },
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
      ],
    });
  });

  test("returns jobs filtered by 'title' query string and is case-insensitive", async function () {
    const queryStrings = "title=Dev Level 3";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 3",
          salary: 150000,
          equity: "0.552",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("returns jobs filtered by 'title' query string and is case-insensitive", async function () {
    const queryStrings = "title=3";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 3",
          salary: 150000,
          equity: "0.552",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("returns jobs filtered by 'minSalary' query string", async function () {
    const queryStrings = "minSalary=130000";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
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
      ],
    });
  });

  test("returns jobs filtered by 'hasEquity' and 'title'", async function () {
    const queryStrings = "hasEquity=true&title=2";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 2",
          salary: 140000,
          equity: "0.442",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("returns jobs filtered by all filters", async function () {
    const queryStrings = "title=3&minSalary=150000&hasEquity=true";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 3",
          salary: 150000,
          equity: "0.552",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("returns jobs filtered by hasEquity = true", async function () {
    const queryStrings = "hasEquity=true";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
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
      ],
    });
  });
  test("returns jobs filtered by hasEquity = false", async function () {
    const queryStrings = "hasEquity=false";
    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Dev Level 0",
          salary: 80000,
          equity: "0",
          companyHandle: "c1",
        },
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
      ],
    });
  });

  test("fails: invalid 'companyHandle' input", async function () {
    const queryStrings = "companyHandle=c1";

    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"companyHandle" is not allowed');
  });

  test("fails: invalid 'id' input", async function () {
    const queryStrings = "id=c1";

    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"id" is not allowed');
  });

  test("fails: detect SQL injection", async function () {
    // const queryStrings =
    //   "minEmployees=&name=DROP%20TABLE%20users;SELECT&maxEmployees=2";

    const queryStrings = "minSalary=DROP%20TABLE%20users;SELECT";

    const resp = await request(app).get(`/jobs?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"minSalary" must be a number');
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  const newJob = {
    title: "Dev Level 6",
    salary: 155300,
    equity: 0.82,
    companyHandle: "c1",
  };

  test("works for jobs/1", async function () {
    //PEER Below I created a new job via the POST route rather than at the db.create() model level, since I wanted to maintain consistency in this test file which is focused on testing routes. Or is there any reason to have created the job at the model level?
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    const resp = await request(app).get(`/jobs/${response.body.job.id}`);
    expect(resp.body).toEqual({
      job: {
        id: response.body.job.id,
        title: "Dev Level 6",
        salary: 155300,
        equity: "0.82",
        companyHandle: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          loglUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toBe('"id" must be a number');
  });

  test("detect invalid input parameter value", async function () {
    const resp = await request(app).get(`/jobs/jl;asjdf;l`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"id" must be a number');
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  const newJob = {
    title: "Dev Level 6",
    salary: 155300,
    equity: 0.82,
    companyHandle: "c1",
  };

  test("works for admin users", async function () {
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    const resp = await request(app)
      .patch(`/jobs/${response.body.job.id}`)
      .send({
        title: "Dev Level 7",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: response.body.job.id,
        title: "Dev Level 7",
        salary: 155300,
        equity: "0.82",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    const resp = await request(app)
      .patch(`/jobs/${response.body.job.id}`)
      .send({
        title: "Dev Level 7",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    const resp = await request(app)
      .patch(`/jobs/${response.body.job.id}`)
      .send({
        title: "Dev Level 99",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("invalid :id input", async function () {
    const resp = await request(app)
      .patch(`/jobs/nope`)
      .send({
        title: "Dev Level 99",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toBe('"id" must be a number');
  });

  test("bad request on companyHandle change attempt", async function () {
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .patch(`/jobs/${response.body.job.id}`)
      .send({
        companyHandle: "c1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(400);

    expect(resp.body.error.message).toBe('"companyHandle" is not allowed');
  });

  test("bad request on invalid req.body data", async function () {
    const response = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .patch(`/jobs/${response.body.job.id}`)
      .send({
        minSalary: "not-a-Salary",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toBe('"minSalary" must be a number');
  });

  test("company not found", async function () {
    const resp = await request(app)
      .patch(`/jobs/3333`)
      .send({
        title: "Dev Level 99",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body.error.message).toBe("No job with 3333 id");
  });
});

/************************************** DELETE /jobs/:id */
//PEER - Can you tell me if the use of beforeEach and afterEach below is incorrect? I needed to created and delete a new job for every test below,
// so I used beforeEach and afterEach to reduce duplicate code. Or could there be a better way to reduce duplicated code?
describe("DELETE /jobs/:id", function () {
  let jobID = 0;

  beforeEach(async () => {
    // Create a job before each test to access the jobID.
    const newJob = {
      title: "Dev Level 6",
      salary: 155300,
      equity: 0.82,
      companyHandle: "c1",
    };
    const jobCreated = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    jobID = jobCreated.body.job.id;
  });

  afterEach(async () => {
    // Delete the job after each test
    if (jobID) {
      await request(app)
        .delete(`/jobs/${jobID}`)
        .set("authorization", `Bearer ${adminToken}`);
    }
  });

  test("admin can delete a job", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobID}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobID}` });
  });

  test("unauthorized user cannot delete a job ", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobID}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toBe("Unauthorized"); //PEER Is checking the message excessive if the expect(resp.statusCode).toEqual(401) test already passed?
  });
  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/${jobID}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toBe("Unauthorized");
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/48938111`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.body.error.message).toBe("No job with 48938111 id.");
  });

  // PEER I noticed that the .delete(`/jobs/3848938111`) request below triggers an unexpected PostgresSQL error related to maximum transaction IDs.
  // In a production environment, what are beset practices for catching/handling these unexpected errors and sending an appropriate message to the client?
  // In this case:
  // I chose to return to the client a 500 status error message of 'Unexpected error occurred. Please try again.' These database-level errors are being caught by routers and forwarded to the 'Generic error handler' in /app.js on line 42.
  // Is there a better way for handling unpredictable 500 internal error messages?

  test("500 internal error", async function () {
    const resp = await request(app)
      .delete(`/jobs/3848938111`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
    expect(resp.body.error.message).toBe(
      "Unexpected error occurred. Please try again."
    );
  });
});
