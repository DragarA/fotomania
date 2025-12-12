const nodeConfig = require('@repo/eslint-config/node');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.config.js',
      '.eslintrc.js',
    ],
  }
);
