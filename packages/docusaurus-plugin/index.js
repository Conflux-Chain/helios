const path = require('path')
const jsbi = path.resolve(__dirname, '../../node_modules/jsbi/dist/jsbi-cjs.js')

module.exports = function (/* context, options */) {
  return {
    name: '@fluent-wallet/docusaurus-plugin',
    configureWebpack(_config, _isServer, {currentBundler}) {
      return {
        module: {rules: [{test: /\.m?js$/, resolve: {fullySpecified: false}}]},
        resolve: {
          fallback: {stream: false, buffer: require.resolve('buffer/')},
          alias: {jsbi},
        },
        plugins: [
          new currentBundler.instance.ProvidePlugin({
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
