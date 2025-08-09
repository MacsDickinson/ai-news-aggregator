module.exports = {
  extends: [
    'eslint:recommended',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
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
    '**/*.ts', // Skip TypeScript files for now - will be caught by TypeScript compiler
    '**/*.tsx',
  ],
};