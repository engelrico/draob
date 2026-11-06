// ESLint flat config (ESLint 10): recommended core rules + React hooks rules (incl. the React Compiler checks),
// Chrome extension globals, unused vars as warnings.
// Not used on purpose: eslint-plugin-react (peer-limited to ESLint 9, ~125 packages). Core ESLint tracks JSX
// references, so imported components used only in JSX are not reported as unused. Lists without `key` are
// not linted; React warns about them at runtime.
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'tools/store-assets/.work/**'] },
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.webextensions, ...globals.jest, ...globals.node },
    },
    rules: { 'no-unused-vars': 'warn' },
  },
  // CommonJS helper scripts (Jest transformer, license check, version sync)
  {
    files: ['scripts/**/*.cjs', 'scripts/check-licenses.js', 'scripts/sync-manifest-version.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
];
