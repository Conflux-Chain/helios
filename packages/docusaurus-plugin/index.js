module.exports = function (/* context, options */) {
  return {
    name: '@cfxjs/docusaurus-plugin',
    // configureWebpack(config, isServer, utils) {return {}},
    configurePostCss(postcssOptions) {
      // Appends new PostCSS plugin.
      postcssOptions.plugins.push(
        require('tailwindcss')({
          ...require('../../scripts/tailwind.config.js'),
          prefix: 'tw-',
        }),
      )
      postcssOptions.plugins.push(require('autoprefixer')())
      return postcssOptions
    },
  }
}
