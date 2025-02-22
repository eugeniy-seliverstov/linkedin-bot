import globals from 'globals'
import js from '@eslint/js'

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
    },
  },
  js.configs.recommended,
]
