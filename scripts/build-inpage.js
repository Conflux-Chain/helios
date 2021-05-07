const {resolve} = require('path')
const esbuild = require('esbuild')
const {isDev} = require('./snowpack.utils.js')

const esbuildOpts = {
  entryPoints: [resolve(__dirname, '../packages/inpage/index.js')],
  watch: isDev(),
  minify: !isDev(),
  bundle: true,
  outfile: resolve(
    __dirname,
    isDev()
      ? '../packages/browser-extension/inpage.js'
      : '../packages/browser-extension/build/inpage.js',
  ),
}

module.exports = () => esbuild.build(esbuildOpts)
