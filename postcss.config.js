const cssnano = require('cssnano')
const tailwindConfig = require('./scripts/tailwind.config.js')
const {isProd} = require('./scripts/env.js')

module.exports = {
  plugins: [
    require('tailwindcss')(tailwindConfig),
    ...(isProd() ? [cssnano()] : []),
  ],
}
