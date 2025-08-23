// eslint.config.js  (ESM)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  // what to ignore (replaces .eslintignore)
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'out/**', '*.sol'],
  },

  // JS + TS recommended bases
  js.configs.recommended,
  ...tseslint.configs.recommended, // non type-aware (fast)

  // project rules
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      // enable TS-aware path resolution for eslint-plugin-import
      'import/resolver': {
        typescript: { project: true },
      },
    },
    rules: {
      // TS QoL
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-ignore': 'allow-with-description',
      }],

      // import hygiene
      'import/order': ['warn', {
        groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index']],
        'newlines-between': 'always',
      }],

      // misc
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'smart'],
      'no-console': 'off',
    },
  },
];
