require('./setup-dotenv')
const swcJest = require('@swc/jest')

const snowpackImportMetaEnv = code =>
  typeof code === 'string'
    ? code.replaceAll('import.meta.env', 'process.env')
    : code

module.exports = {
  process: (...args) => {
    args[0] = snowpackImportMetaEnv(...args)
    args[0] = swcJest.process(...args)
    return args[0]
  },
}
