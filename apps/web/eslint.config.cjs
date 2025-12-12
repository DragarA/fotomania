const reactConfig = require('@repo/eslint-config/react');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...reactConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Config files don't need TypeScript project
    files: ['*.config.ts', '*.config.js', '*.config.cjs'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'src/routeTree.gen.ts',
      '.eslintrc.js',
    ],
  }
);
