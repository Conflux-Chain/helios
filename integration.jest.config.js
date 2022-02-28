const defaultConfig = require('./jest.config.js')
const Config = {
  testMatch: ['<rootDir>/packages/**/*.integration.test.[jt]s?(x)'],
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage/integration',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['packages/**/*.js', '!packages/rpcs/*/doc.js'],
}
module.exports = Object.assign({}, defaultConfig, Config)
