// jest.config.js
module.exports = {
  testMatch: ["<rootDir>/src/components/Navbar.test.js"], // only your single test
  testPathIgnorePatterns: ["/node_modules/"],             // ignore node_modules
  coverageDirectory: "coverage",                          // coverage folder
};
