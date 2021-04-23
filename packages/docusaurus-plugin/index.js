module.exports = function (/* context, options */) {
  return {
    name: '@cfxjs/docusaurus-plugin',
    // configureWebpack(config, isServer, utils) {return {}},
    configurePostCss(postcssOptions) {
      // Appends new PostCSS plugin.
      const {
        tailwindConfig,
        autoprefixer,
        twcssJit,
      } = require('../../scripts/postcss.config.js')
      postcssOptions.plugins.push(twcssJit({...tailwindConfig, prefix: 'tw-'}))
      postcssOptions.plugins.push(autoprefixer())
      return postcssOptions
    },
  }
}
