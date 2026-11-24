const {resolve} = require('path')
const esbuild = require('esbuild')
const {isDev} = require('./snowpack.utils.js')

const esbuildOpts = {
  entryPoints: [resolve(__dirname, '../packages/ext-reload/index.js')],
  minify: false,
  bundle: true,
  outfile: resolve(__dirname, '../packages/browser-extension/reload.js'),
}

module.exports = async () =>
  isDev() && (await esbuild.context(esbuildOpts)).watch()
