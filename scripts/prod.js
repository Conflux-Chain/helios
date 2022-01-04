/**
 * @fileOverview snowpack prod
 * @name snowpackjs.js
 */
require('./setup-dotenv.js')
require('./before_all.js')
const {resolve} = require('path')
const buildContentScript = require('./build-content-script.js')
// const buildInpage = require('./build-inpage.js')

const {setEnvBasedOnArgv} = require('./snowpack.utils.js')
setEnvBasedOnArgv()

const {loadConfiguration, build} = require('@yqrashawn/snowpack')

const builds = [
  resolve(__dirname, '../packages/background/snowpack.config.cjs'),
  resolve(__dirname, '../packages/popup/snowpack.config.cjs'),
]

async function cleanup(exitCode) {
  process.exit(exitCode)
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)
process.on('uncaughtException', err => {
  if (err?.message?.includes('EADDRINUSE')) return
  throw err
})
;(async () => {
  // await loadConfiguration(undefined, builds[0]).then(config => build({config}))
  // await loadConfiguration(undefined, builds[1]).then(config => build({config}))
  // await buildContentScript()
  // await buildInpage()

  await Promise.all([
    ...builds.map(b =>
      loadConfiguration(undefined, b).then(config => build({config})),
    ),
    buildContentScript(),
    // buildInpage(),
  ])
  await require('./after_prod.js')()
  process.exit(0)
})()
