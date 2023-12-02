const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: throws error when datatoUpdate is empty", function () {
    const datatoUpdate = {};
    const jsToSql = {};
    expect(() => {
      sqlForPartialUpdate(datatoUpdate, jsToSql);
    }).toThrow(new Error("No data"));
  });

  test("works: ", function () {
    const datatoUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const expectedObject = {
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    };
    expect(sqlForPartialUpdate(datatoUpdate, jsToSql)).toEqual(expectedObject);
  });
});

//PEER should I write tests for sqlForFilteredQuery() if I'm already testing this function  via the route requests?

// describe("sqlForFilteredQuery", function () {
//   test("works: throws error when datatoUpdate is empty", function () {
//     const datatoUpdate = {};
//     const jsToSql = {};
//     expect(() => {
//       sqlForPartialUpdate(datatoUpdate, jsToSql);
//     }).toThrow(new Error("No data"));
//   });

//   test("works: ", function () {
//     const datatoUpdate = { firstName: "Aliya", age: 32 };
//     const jsToSql = {
//       firstName: "first_name",
//       lastName: "last_name",
//       isAdmin: "is_admin",
//     };
//     const expectedObject = {
//       setCols: '"first_name"=$1, "age"=$2',
//       values: ["Aliya", 32],
//     };
//     expect(sqlForPartialUpdate(datatoUpdate, jsToSql)).toEqual(expectedObject);
//   });
// });
