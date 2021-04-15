const autoprefixer = require('autoprefixer')
const twcssJit = require('@tailwindcss/jit')
const postcss = require('postcss')
const tailwindConfig = require('./tailwind.config.js')

module.exports = postcss([twcssJit(tailwindConfig), autoprefixer()])
