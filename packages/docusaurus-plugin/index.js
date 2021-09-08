module.exports = function (/* context, options */) {
  return {
    name: '@fluent-wallet/docusaurus-plugin',
    configureWebpack() {
      return {
        module: {rules: [{test: /\.m?js$/, resolve: {fullySpecified: false}}]},
        resolve: {fallback: {stream: false}},
      }
    },
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
