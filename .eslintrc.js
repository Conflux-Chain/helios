module.exports = {
  extends: [
    'standard',
    'plugin:jest/recommended',
    'plugin:testing-library/react',
    'prettier',
  ],
  plugins: ['prettier'],
  globals: {
    browser: 'readonly',
  },
  rules: {
    'import/no-duplicates': 0,
  },
};
