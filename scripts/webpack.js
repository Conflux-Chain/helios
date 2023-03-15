process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

// eslint-disable-next-line import/no-extraneous-dependencies
const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const path = require('path')
const config = require('../webpack.config')
const env = require('./env')

const options = config.chromeExtension || {}
const excludeEntriesToHotReload = options.notHotReload || []

// eslint-disable-next-line no-restricted-syntax
for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack/hot/dev-server',
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
    ].concat(config.entry[entryName])
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
)

delete config.chromeExtensionBoilerplate

const compiler = webpack(config)

const server = new WebpackDevServer(
  {
    https: false,
    hot: false,
    client: false,
    port: env.PORT,
    host: 'localhost',
    static: {
      directory: path.join(__dirname, '../dist'),
      watch: false,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}`,
      writeToDisk: true,
    },
    allowedHosts: 'all',
  },
  compiler
)

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept()
}

// eslint-disable-next-line no-extra-semi
;(async () => {
  await server.start()
})()
