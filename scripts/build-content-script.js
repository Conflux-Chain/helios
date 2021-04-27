const {resolve} = require('path')
const esbuild = require('esbuild')
const {isDev} = require('./snowpack.utils.js')

const esbuildOpts = {
  entryPoints: [resolve(__dirname, '../packages/content-script/index.js')],
  watch: isDev(),
  minify: !isDev(),
  bundle: true,
  outfile: resolve(
    __dirname,
    isDev()
      ? '../packages/browser-extension/content-script.js'
      : '../packages/browser-extension/build/content-script.js',
  ),
}

module.exports = () => esbuild.build(esbuildOpts)
