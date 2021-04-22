const swc = require('@swc/core')
const path = require('path')

const root = path.resolve(__dirname, '..')

module.exports = function (/* snowpackConfig, pluginOptions */) {
  return {
    name: 'helios-snowpack-swc-plugin',
    transform({contents, fileExt, id}) {
      if (fileExt !== '.js' && fileExt !== '.jsx') return
      if (id.includes('packages/spec/src') || id.includes('packages/db/src'))
        return contents
      return swc.transformSync(contents, {
        cwd: root,
        root,
        filename: id,
        // sourceMaps: 'inline',
      }).code
    },
  }
}
