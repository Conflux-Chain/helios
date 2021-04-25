/**
 * @fileOverview snowpack prod
 * @name snowpackjs.js
 */
require('./before_all.js')
require('./setup-dotenv.js')
const {resolve} = require('path')

const {setEnvBasedOnArgv} = require('./snowpack.utils.js')
setEnvBasedOnArgv()

const {loadConfiguration, build} = require('@yqrashawn/snowpack')

const builds = [
  resolve(__dirname, '../packages/background/snowpack.config.cjs'),
  resolve(__dirname, '../packages/popup/snowpack.config.cjs'),
  resolve(__dirname, '../packages/inpage/snowpack.config.cjs'),
]

async function cleanup(exitCode) {
  process.exit(exitCode)
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', (...args) => console.error(...args))
;(async () => {
  await Promise.all(
    builds.map(b =>
      loadConfiguration(undefined, b).then(config => build({config})),
    ),
  )
  await require('./after_prod.js')()
  process.exit(0)
})()
