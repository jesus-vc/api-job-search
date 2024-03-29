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

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img",
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("returns companies filtered by 'name' query string and is case-insensitive", async function () {
    const queryStrings = "name=C3";
    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("returns companies filtered by 'minEmployees' query string", async function () {
    const queryStrings = "minEmployees=3";
    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("returns 1 company filtered by multiple filters", async function () {
    const queryStrings = "minEmployees=2&name=C&maxEmployees=2";
    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c2",
          name: "C2",
          numEmployees: 2,
          description: "Desc2",
          logoUrl: "http://c2.img",
        },
      ],
    });
  });

  test("returns 2 companies filtered by multiple filters", async function () {
    const queryStrings = "minEmployees=1&name=C&maxEmployees=2";
    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          numEmployees: 1,
          description: "Desc1",
          logoUrl: "http://c1.img",
        },
        {
          handle: "c2",
          name: "C2",
          numEmployees: 2,
          description: "Desc2",
          logoUrl: "http://c2.img",
        },
      ],
    });
  });

  test("fails: fails: invalid input parameters keys", async function () {
    const queryStrings = "handle=c1&description=Desc1&maxEmployees=2";

    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"handle" is not allowed');
  });

  test("fails: fails: invalid input parameter values", async function () {
    const queryStrings =
      "minEmployees=&name=DROP%20TABLE%20users;SELECT&maxEmployees=2";

    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe('"minEmployees" must be a number');
  });

  test("fails: minEmployees greather than maxEmployees", async function () {
    const queryStrings = "minEmployees=33&name=C&maxEmployees=2";

    const resp = await request(app).get(`/companies?${queryStrings}`);

    expect(resp.status).toBe(400);

    expect(resp.body.error.message).toBe(
      "minEmployees cannot be greater than maxEmployees"
    );
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
      .get("/companies")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: [
          {
            id: expect.any(Number),
            title: "Dev Level 1",
            salary: 120000,
            equity: "0.12",
          },
          {
            id: expect.any(Number),
            title: "Dev Level 0",
            salary: 80000,
            equity: "0",
          },
        ],
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const newCompany = {
      handle: "c10",
      name: "New",
      description: "DescNew",
      numEmployees: 10,
      logoUrl: "http://new.img",
    };
    const result = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${adminToken}`);

    expect(result.statusCode).toEqual(201);
    const resp = await request(app).get(`/companies/c10`);
    expect(resp.body).toEqual({
      company: {
        handle: "c10",
        name: "New",
        description: "DescNew",
        numEmployees: 10,
        logoUrl: "http://new.img",
        jobs: [],
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/companies/c1`).send({
      name: "C1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
