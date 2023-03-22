process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

const webpack = require('webpack')
const config = require('../webpack.config')

delete config.chromeExtension

config.mode = 'production'

webpack(config, (err) => {
  if (err) throw err
})
