module.exports = {
  extends: [
    'eslint:recommended',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'build/',
    'public/build/',
    'node_modules/',
    '**/*.ts', // TypeScript files handled by tsc
    '**/*.tsx',
  ],
};