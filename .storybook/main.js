require('../scripts/setup-dotenv')
const {resolve} = require('path')

module.exports = {
  stories: [
    '../packages/**/*.stories.mdx',
    '../packages/**/*.stories.@(js|jsx|ts|tsx)',
    // '../stories/**/*.stories.mdx',
    // '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-essentials',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-cssresources',
    'storybook-addon-outline',
    'storybook-addon-pseudo-states',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: () =>
            require(resolve(__dirname, '../scripts/postcss.config.js')),
        },
      },
    },
  ],
  // babel: async options => {
  //   return {
  //     ...options,
  //     plugins: [...options.plugins, '@babel/plugin-syntax-import-meta'],
  //   }
  // },

  // webpackFinal: config => {
  //   // config.module.rules.push({
  //   //   test: /\.[tj]sx?$/,
  //   //   loader: [
  //   //     This assumes snowpack@>=2.9.0
  //   //     require.resolve('@open-wc/webpack-import-meta-loader'),
  //   //     require.resolve(
  //   //       '@snowpack/plugin-webpack/plugins/proxy-import-resolve',
  //   //     ),
  //   //   ],
  //   // })
  //   // config.plugins.push(
  //   //   new (require('webpack').DefinePlugin)({
  //   //     __SNOWPACK_ENV__: JSON.stringify(process.env),
  //   //   }),
  //   // )

  //   // console.log(config.resolve.alias)
  //   // config.resolve.alias = {
  //   //   ...config.resolve.alias,
  //   //   ...require('../scripts/snowpack.popup.config.js').alias,
  //   // }
  //   // config.resolve.alias = {
  //   //   ...config.resolve.alias,
  //   //   ...require('../scripts/snowpack.popup.config.js').alias,
  //   //   react: resolve(__dirname, '../node_modules/react'),
  //   //   'react-dom': resolve(__dirname, '../node_modules/react-dom'),
  //   //   'react-use': resolve(__dirname, '../node_modules/react-use'),
  //   // }
  //   // config.externals = {...config.externals, react: 'React'}

  //   return config
  // },
}
