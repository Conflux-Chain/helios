/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const path = require('path')

// const snowpackReactJestConfig = require('@snowpack/app-scripts-react/jest.config.js')()

module.exports = {
  // ...snowpackReactJestConfig,
  transform: {
    '^.+\\.(t|j)sx?$': path.resolve(
      __dirname,
      './scripts/jest-transformers.mjs',
    ),
  },

  testEnvironment: 'jsdom',
  // The glob patterns Jest uses to detect test files
  testMatch: ['<rootDir>/packages/**/*.test.[jt]s?(x)'],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [path.resolve(__dirname, './scripts/jest-global-setup.js'),],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [
    ...[
      '@fluent-wallet/jest-helper/setup-after-env.js',
      'jest-webextension-mock',
      './scripts/jest-test-jsdom-env.js',
    ],
  ],

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  watchPathIgnorePatterns: [
    '<rootDir>/.git',
    '<rootDir>/node_modules',
    '<rootDir>/scripts',
    '<rootDir>/coverage',
  ],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    // also transform react and react-native
    // 'node_modules/(?!(react|react-native)/)',
    'node_modules/(?!(tslib|randombytes|brorand|react-use)/)',
    // "\\.pnp\\.[^\\/]+$"
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/packages/*/build',
    '/.shadow-cljs',
    '/packages/db/.shadow-cljs/',
    '/packages/spec/src/spec.js',
    '/packages/spec/.shadow-cljs/',
    '/packages/ui/components/Radio',
    '/contracts/',
  ],

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  modulePathIgnorePatterns: ['/packages/browser-extension'],
  injectGlobals: true,
  globals: {
    // fixes (Buffer.from(...) instanceof Uint8Array) === true
    Uint8Array: Uint8Array,
  },

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8', // v8 is not stable

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'index.dev.js',
    'index.prod.js',
    '/websites/doc',
    '/packages/browser-extension',
    '/packages/csp',
    '/packages/consts',
    '/packages/utils',
    '/packages/utils/env.js',
    '/packages/spec/',
    '/packages/db/',
    '/packages/bytes/',
    '/testlib/',
    '/packages/workspace-tools',
    '/packages/docusaurus-plugin',
    '/packages/doc-ui',
    '/packages/rpcs/*/doc.js',
    '/packages/ext-reload',
    '/packages/test-helpers',
    '.*.test.jsx?', // eslint-disable-line no-useless-escape
    '.*.integration.test.jsx?', // eslint-disable-line no-useless-escape
    '/packages/contract-method-name/constance.js',
    '/packages/ui/components/*/assets/*',
    '/packages/ui/components/Tooltip/Placements.js',
    '/packages/ui/icons/*',
    '/packages/jest-helper/',
    '/contracts/',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage/ut',

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['packages/**/*.js'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    tslib: 'tslib/tslib.es6.js',
    'react-use': 'react-use/esm/index.js',
    uuid: require.resolve('uuid'),
  },
  // globalSetup: path.resolve(__dirname, './scripts/jest-global-setup.js')
}
