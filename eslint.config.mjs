import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'web-build/**'],
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  prettierConfig,
);
