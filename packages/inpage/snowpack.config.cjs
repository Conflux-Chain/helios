const baseConfig = require('../../scripts/snowpack.base.config.js')
const {mergeConfig} = require('../../scripts/snowpack.utils.js')
const path = require('path')

const root = __dirname

module.exports = mergeConfig(baseConfig, {
  cacheDir: 'snowpack-inpage',
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
  packageOptions: {},
  devOptions: {
    port: 18002,
    hmrErrorOverlay: false,
  },
  buildOptions: {
    out: path.resolve(__dirname, '../browser-extension/build/inpage'),
  },
  optimize: {
    entrypoints: ['dist/index.js'],
  },
})
