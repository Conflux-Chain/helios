const baseConfig = require('./snowpack.base.config')
const {mergeConfig} = require('./snowpack.utils')
const path = require('path')

const root = path.resolve(__dirname, '../packages/background')

module.exports = mergeConfig(baseConfig, {
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
  packageOptions: {},
  devOptions: {
    port: 18003,
    hmrErrorOverlay: false,
  },
  buildOptions: {
    out: path.resolve(
      __dirname,
      '../packages/browser-extension/build/background',
    ),
  },
  optimize: {
    entrypoints: ['dist/index.js', 'dist/index.prod.js'],
  },
})
