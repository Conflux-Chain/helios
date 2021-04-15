const autoprefixer = require('autoprefixer')
const twcssJit = require('@tailwindcss/jit')
const postcss = require('postcss')
const tailwindConfig = require('./tailwind.popup.config')

module.exports = postcss([twcssJit(tailwindConfig), autoprefixer()])
