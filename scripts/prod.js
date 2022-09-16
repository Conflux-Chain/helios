/**
 * @fileOverview snowpack prod
 * @name snowpackjs.js
 */
const setupDotenv = require('./setup-dotenv.js')
setupDotenv()
require('./before_all.js')
const {resolve} = require('path')
const buildContentScript = require('./build-content-script.js')
const buildBg = require('./build/bg.js')

const buildPopup = require('./build/popup.js')
require(resolve(__dirname, '../packages/background/snowpack.config.cjs'))
require(resolve(__dirname, '../packages/popup/snowpack.config.cjs'))

const {setEnvBasedOnArgv} = require('./snowpack.utils.js')
setEnvBasedOnArgv()

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
  await Promise.all([buildContentScript(), buildBg.analyze(), buildPopup()])
  await require('./after_prod.js')()
  process.exit(0)
})()
