const baseConfig = require('./base.js');

module.exports = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...require('globals').node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
