const {resolve} = require('path')
const esbuild = require('esbuild')
const {isDev} = require('./snowpack.utils.js')

const esbuildOpts = {
  entryPoints: [resolve(__dirname, '../packages/inpage/index.js')],
  minify: !isDev(),
  bundle: true,
  outfile: resolve(
    __dirname,
    isDev()
      ? '../packages/browser-extension/inpage.js'
      : '../packages/browser-extension/build/inpage.js',
  ),
}

module.exports = async () =>
  isDev()
    ? (await esbuild.context(esbuildOpts)).watch()
    : esbuild.build(esbuildOpts)
