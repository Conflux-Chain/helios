/**
 * @fileOverview snowpack postcss loader for popup
 * @name snowpack.postcss.plugin.js
 */
const fs = require('fs')
const util = require('util')
const postcss = require('./postcss.config.js')

module.exports = function () {
  return {
    name: 'snowpack-postcss-plugin',
    resolve: {
      input: ['.css'],
      output: ['.css'],
    },
    async load({filePath}) {
      const origCSS = await util.promisify(fs.readFile)(filePath)
      const {css} = await postcss.process(origCSS.toString(), {
        from: filePath,
        map: {
          inline: true,
        },
      })
      return css
    },
  }
}
