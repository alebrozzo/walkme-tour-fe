const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'web-build/**', 'eslint.config.js'],
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  prettierConfig,
);
