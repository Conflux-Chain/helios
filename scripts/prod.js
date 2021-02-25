/**
 * @fileOverview snowpack prod
 * @name snowpackjs.js
 */
require('./before_all')
require('./setup-dotenv')

const {setEnvBasedOnArgv} = require('./snowpack.utils')
setEnvBasedOnArgv()

const {loadConfiguration, build} = require('snowpack')

const builds = [
  'scripts/snowpack.background.config.js',
  'scripts/snowpack.popup.config.js',
  'scripts/snowpack.inpage.config.js',
]

async function cleanup(exitCode) {
  process.exit(exitCode)
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', cleanup)
;(async () => {
  await Promise.all([
    builds.map(b =>
      loadConfiguration(undefined, b).then(config => build({config})),
    ),
  ])
  require('./after_prod')
})()
