const path = require('path')
const webpack = require(path.resolve(__dirname, '../../node_modules/webpack'))
const jsbi = path.resolve(__dirname, '../../node_modules/jsbi/dist/jsbi-cjs.js')

module.exports = function (/* context, options */) {
  return {
    name: '@fluent-wallet/docusaurus-plugin',
    configureWebpack() {
      return {
        module: {rules: [{test: /\.m?js$/, resolve: {fullySpecified: false}}]},
        resolve: {
          fallback: {stream: false, buffer: require.resolve('buffer/')},
          alias: {jsbi},
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ],
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
