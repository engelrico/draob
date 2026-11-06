module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  transform: { '\\.[jt]sx?$': '<rootDir>/scripts/jest-esbuild-transform.cjs' },
  collectCoverageFrom: ['src/shared/**/*.js'],
};
