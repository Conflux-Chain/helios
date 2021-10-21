const swc = require('@swc/core')
const path = require('path')
const {isProd} = require('./snowpack.utils.js')

const root = path.resolve(__dirname, '..')

const ignores = ['packages/spec/src', 'packages/db/src', 'node_modules']

module.exports = function (/* snowpackConfig, pluginOptions */) {
  return {
    name: 'helios-snowpack-swc-plugin',
    transform({contents, fileExt, id}) {
      if (fileExt !== '.js' && fileExt !== '.jsx') return

      // fix the assert node polyfill (in ethereumjs pakcages)
      if (contents.includes('assert_1.default('))
        contents = contents.replaceAll(
          'assert_1.default(',
          'assert_1.default.assert(',
        )

      // fix readable-stream error with snowpack
      // https://github.com/nodejs/readable-stream/issues/456
      if (id.endsWith('/cip-23/lib/es/utils/buffer.js'))
        return 'export * from "@fluent-wallet/signature/cip-23-utils-buffer.js"'

      if (ignores.reduce((acc, test) => acc || id.includes(test), false))
        return contents
      return swc.transformSync(contents, {
        cwd: root,
        root,
        filename: id,
        sourceMaps: false,
      }).code
    },
    optimize(/* {buildDirectory, log} */) {
      if (!isProd()) return
    },
  }
}
