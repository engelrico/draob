module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  transform: { '\\.[jt]sx?$': '<rootDir>/scripts/jest-esbuild-transform.cjs' },
  // V8 coverage: our esbuild transformer adds no instrumentation, so the default (babel) provider reports 0 %.
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/shared/**/*.js'],
};
