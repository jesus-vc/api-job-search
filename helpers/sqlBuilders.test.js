const { buildPartialUpdateQuery } = require("./sqlBuilders");

describe("buildPartialUpdateQuery", function () {
  test("works: throws error when datatoUpdate is empty", function () {
    const datatoUpdate = {};
    const jsToSql = {};
    expect(() => {
      buildPartialUpdateQuery(datatoUpdate, jsToSql);
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
    expect(buildPartialUpdateQuery(datatoUpdate, jsToSql)).toEqual(
      expectedObject
    );
  });
});

//PEER Is it okay that I didn't write a unit test for buildPartialUpdateQuery() since it's already being tested via an integration test at the route level?
// If this fn does require a unit rest, in production code how would I be able to tell which fns require unit testing when they're already being tested via integration tests?

// describe("buildPartialUpdateQuery", function () {
//   test("works: throws error when datatoUpdate is empty", function () {
//     const datatoUpdate = {};
//     const jsToSql = {};
//     expect(() => {
//       buildPartialUpdateQuery(datatoUpdate, jsToSql);
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
//     expect(buildPartialUpdateQuery(datatoUpdate, jsToSql)).toEqual(expectedObject);
//   });
// });
