import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // ============================================
      // Variables and declarations
      // ============================================
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-use-before-define': ['error', { functions: false }],
      'no-shadow': 'error',

      // ============================================
      // Code quality
      // ============================================
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-duplicate-imports': 'error',
      'no-param-reassign': ['error', { props: false }],

      // ============================================
      // Security (prevent dangerous code)
      // ============================================
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-return-await': 'error',

      // ============================================
      // Promises et async/await
      // ============================================
      'no-async-promise-executor': 'error',
      'require-await': 'error',
      'no-promise-executor-return': 'error',
      'prefer-promise-reject-errors': 'error',

      // ============================================
      // Error handling
      // ============================================
      'no-throw-literal': 'error',
      'no-ex-assign': 'error',
      'no-unsafe-finally': 'error',

      // ============================================
      // Node.js specific
      // ============================================
      'no-console': 'off',
      'no-process-exit': 'error',
      'no-path-concat': 'error',
      'handle-callback-err': 'error',

      // ============================================
      // Express.js best practices
      // ============================================
      'callback-return': ['error', ['callback', 'cb', 'next']],

      // ============================================
      // Performance
      // ============================================
      'no-await-in-loop': 'warn',

      // ============================================
      // Style and readability
      // ============================================
      'no-extra-boolean-cast': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-exponentiation-operator': 'error',
      yoda: ['error', 'never'],
    },
  },
  {
    ignores: ['node_modules/**', 'data/**', 'dist/**', 'coverage/**'],
  },
  prettierRecommended,
]
