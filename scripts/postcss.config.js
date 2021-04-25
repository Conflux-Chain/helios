const autoprefixer = require('autoprefixer')
const twcssJit = require('@tailwindcss/jit')
// const postcss = require('postcss')
const tailwindConfig = require('./tailwind.config.js')

module.exports = {
  plugins: [twcssJit(tailwindConfig), autoprefixer()],
  tailwindConfig,
  autoprefixer,
  twcssJit,
}
//postcss([twcssJit(tailwindConfig), autoprefixer()])
