const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const tailwindConfig = require('./scripts/tailwind.config.js')
const {isProd} = require('./scripts/snowpack.utils.js')

module.exports = {
  plugins: [
    require('tailwindcss')(tailwindConfig),
    autoprefixer(),
    isProd() && cssnano(),
  ],
}
