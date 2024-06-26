module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    rules: {
      // Additional rules can be added here
      '@typescript-eslint/no-explicit-any': 'off',
    },
  };
  