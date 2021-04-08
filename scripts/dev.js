/**
 * @fileOverview snowpack dev
 * @name snowpackjs.js
 */
require('./before_all')
require('./setup-dotenv')

const {setEnvBasedOnArgv} = require('./snowpack.utils')
setEnvBasedOnArgv()

const {
  loadConfiguration,
  startServer,
  clearCache,
} = require('@yqrashawn/snowpack')

const builds = [
  'scripts/snowpack.background.config.js',
  'scripts/snowpack.popup.config.js',
  'scripts/snowpack.inpage.config.js',
]
// let servers = []

async function cleanup(exitCode) {
  console.log('Clanup before exit...')
  // await Promise.all(servers.map(s => s && s.shutdown && s.shutdown()))
  // if (exitCode || exitCode === 0) console.log(exitCode)
  process.exit(exitCode)
}

const shouldCleanCache =
  process.argv.includes['-r'] || process.argv.includes['--reload']

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', cleanup)
;(async () => {
  if (shouldCleanCache) await clearCache()
  /* servers =  */ await Promise.all([
    builds.map(b => {
      return loadConfiguration(undefined, b).then(config =>
        startServer({config}),
      )
    }),
  ])
})()
