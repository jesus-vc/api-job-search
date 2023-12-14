//PEER Is it necessary to add "use strict" to this file?

const db = require("../db.js");

async function jobBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await db.query(`
  INSERT INTO companies(handle, name, num_employees, description, logo_url)
  VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
         ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
         ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
  INSERT INTO jobs (title, salary, equity, company_handle)
  VALUES ('Dev Level 1', 120000, 0.12, 'c1'),
  ('Dev Level 2', 140000, 0.442, 'c3'),
  ('Dev Level 3', 150000, 0.552, 'c2')`);
}

async function jobBeforeEach() {
  await db.query("BEGIN");
}

async function jobAfterEach() {
  await db.query("ROLLBACK");
}

async function jobAfterAll() {
  await db.end();
}

module.exports = {
  jobBeforeAll,
  jobBeforeEach,
  jobAfterEach,
  jobAfterAll,
};
