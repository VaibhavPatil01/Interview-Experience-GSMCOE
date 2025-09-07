// eslint.config.js (working with ESLint v9+)

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      // ✅ Best Practices
      // 'no-unused-vars': 'warn',
      // 'no-console': 'warn',
      // 'no-debugger': 'error',
      // 'no-var': 'error',
      // 'prefer-const': 'warn',
      // 'eqeqeq': ['warn', 'always'],
      // 'curly': 'warn',
      // 'no-else-return': 'warn',

      // // ✅ Code Style
      // 'semi': ['warn', 'always'],
      // 'quotes': ['warn', 'single'],
      // 'comma-dangle': ['warn', 'never'],
      // 'indent': ['warn', 2],
      // 'object-curly-spacing': ['warn', 'always'],

      // // ✅ Node.js Specific
      // 'callback-return': 'warn',
      // 'handle-callback-err': 'warn',
      // 'no-process-exit': 'warn'
    }
  }
];
