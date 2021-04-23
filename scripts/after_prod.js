const path = require('path')
const {promisify} = require('util')
const rimraf = require('rimraf')
const rm = promisify(rimraf)
const fs = require('fs-extra')
const cp = fs.copy

module.exports = async function () {
  await Promise.all([
    rm(
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/**/index.dev.js',
      ),
    ),
    rm(
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/**/package.json',
      ),
    ),
    rm(
      path.resolve(__dirname, '../packages/browser-extension/build/**/dev.js'),
    ),
    rm(
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/**/*.mustache',
      ),
    ),
    rm(
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/background/index.html',
      ),
    ),
    rm(
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/inpage/index.html',
      ),
    ),
    cp(
      path.resolve(__dirname, '../packages/browser-extension/images'),
      path.resolve(__dirname, '../packages/browser-extension/build/images'),
    ),
    cp(
      path.resolve(__dirname, '../packages/browser-extension/manifest.json'),
      path.resolve(
        __dirname,
        '../packages/browser-extension/build/manifest.json',
      ),
    ),
    cp(
      path.resolve(__dirname, '../packages/browser-extension/_locales'),
      path.resolve(__dirname, '../packages/browser-extension/build/_locales'),
    ),
  ]).catch(err => {
    console.log('failed to remove dev file in prod build')
    throw err
  })
}
