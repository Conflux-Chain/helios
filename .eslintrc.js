module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  overrides: [],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
  parser: '@babel/eslint-parser',
  rules: {
    semi: 0,
    'react/prop-types': [0],
    'no-param-reassign': ['error', { props: false }],
    'no-console': 'off',
    'comma-dangle': 0,
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'max-classes-per-file': [
      'error',
      {
        ignoreExpressions: true,
        max: 2,
      },
    ],
    'object-curly-newline': 'off',
  },
}
