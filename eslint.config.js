/* eslint-disable @typescript-eslint/no-require-imports */
const tseslint = require('typescript-eslint');
module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'reports/**',
      'playwright-report*/**',
      'test-results*/**',
      'allure-*/**',
      'evidence/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
