const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'web-build/**', 'eslint.config.js'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      curly: ['warn', 'all'],
    },
  },
  prettierConfig,
);
