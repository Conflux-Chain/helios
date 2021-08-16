const autoprefixer = require('autoprefixer')
const tailwindConfig = require('./tailwind.config.js')

module.exports = {
  plugins: [require('tailwindcss')(tailwindConfig), autoprefixer()],
}
