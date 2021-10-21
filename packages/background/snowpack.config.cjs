const baseConfig = require('../../scripts//snowpack.base.config.js')
const {mergeConfig} = require('../../scripts/snowpack.utils.js')
const path = require('path')

const root = __dirname

const mergedConfig = mergeConfig(baseConfig, {
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [...baseConfig.routes],
  devOptions: {
    port: 18003,
    hmrErrorOverlay: false,
  },
  buildOptions: {
    cacheDirPath: path.resolve(
      __dirname,
      '../../node_modules/.cache/snowpack-background',
    ),
    out: path.resolve(__dirname, '../browser-extension/build/background'),
  },
  packageOptions: {
    ...baseConfig.packageOptions,
    cache: '.snowpack-bg',
  },
  optimize: {
    entrypoints: ['dist/index.js', 'dist/index.prod.js'],
  },
})

const shouldExcludeInBackground = path => {
  return /packages\/(doc-ui|ui)/.test(path)
}

mergedConfig.mount = Object.entries(mergedConfig.mount).reduce(
  (acc, [k, v]) => {
    if (shouldExcludeInBackground(k)) return acc
    acc[k] = v
    return acc
  },
  {},
)

module.exports = mergedConfig
