/**
 * @fileOverview snowpack postcss loader for popup
 * @name snowpack.postcss.popup.plugin.js
 */
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
// const precss = require('precss')
const fs = require('fs')
const util = require('util')

module.exports = function () {
  return {
    name: 'snowpack-postcss-popup-plugin',
    resolve: {
      input: ['.css'],
      output: ['.css'],
    },
    async load({filePath}) {
      const origCSS = await util.promisify(fs.readFile)(filePath)
      const {css} = postcss([autoprefixer]).process(origCSS.toString(), {
        from: filePath,
        to: '/dist/App.css',
      })
      return css
    },
  }
}
