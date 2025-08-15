module.exports = {
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '**/*.ts', // TypeScript files handled by tsc
  ],
};