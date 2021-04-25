/**
 * @fileOverview snowpack dev
 * @name snowpackjs.js
 */
require('./before_all.js')
require('./setup-dotenv.js')
const {resolve} = require('path')

const {setEnvBasedOnArgv} = require('./snowpack.utils.js')
setEnvBasedOnArgv()

const {
  loadConfiguration,
  startServer,
  clearCache,
} = require('@yqrashawn/snowpack')

const builds = [
  resolve(__dirname, '../packages/background/snowpack.config.cjs'),
  resolve(__dirname, '../packages/popup/snowpack.config.cjs'),
  resolve(__dirname, '../packages/inpage/snowpack.config.cjs'),
]
// let servers = []

const shouldCleanCache =
  process.argv.includes['-r'] || process.argv.includes['--reload']

async function cleanup(exitCode) {
  console.log('Clanup before exit...')
  // await Promise.all(servers.map(s => s && s.shutdown && s.shutdown()))
  // if (exitCode || exitCode === 0) console.log(exitCode)
  process.exit(exitCode)
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', (...args) => console.error(...args))
;(async () => {
  if (shouldCleanCache) await clearCache()
  /* servers =  */ await Promise.all(
    builds.map(b => {
      return loadConfiguration(undefined, b).then(config =>
        startServer({config}),
      )
    }),
  )
})()
