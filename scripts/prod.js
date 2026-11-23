/**
 * @fileOverview Build the legacy esbuild production bundle
 */
const setupDotenv = require('./setup-dotenv.js')
setupDotenv()
require('./before_all.js')
const {resolve} = require('path')
const buildContentScript = require('./build-content-script.js')
const buildBg = require('./build/bg.js')
const buildPopup = require('./build/popup.js')

const {setEnvBasedOnArgv} = require('./snowpack.utils.js')
setEnvBasedOnArgv()

// Keep the HTML entries used by prod:zip without loading the retired dev server.
const {mustacheRender} = require('./snowpack.utils.js')
for (const page of ['popup', 'notification', 'page']) {
  mustacheRender(
    resolve(__dirname, `../packages/popup/public/${page}.html.mustache`),
    resolve(
      __dirname,
      `../packages/browser-extension/build/popup/${page}.html`,
    ),
    {
      scripts:
        '<link rel="stylesheet" href="dist/index.css" type="text/css" media="screen" />\n<script src="dist/index.js" type="module" charset="utf-8"></script>',
      body: '',
    },
  )
}

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
