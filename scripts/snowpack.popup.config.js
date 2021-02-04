const baseConfig = require('./snowpack.base.config')
const {mergeConfig, isDev, mustacheRender} = require('./snowpack.utils')
const path = require('path')

mustacheRender(
  '../packages/popup/public/index.html.mustache',
  '../packages/popup/public/index.html',
  {
    scripts: isDev()
      ? '<script src="http://localhost:18001/dist/index.dev.js" type="module" charset="utf-8"></script>'
      : '<script src="dist/index.js" type="module" charset="utf-8"></script>',
  },
)
const root = path.resolve(__dirname, '../packages/popup')

module.exports = mergeConfig(baseConfig, {
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
  plugins: [
    ...baseConfig.plugins,
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
  ],
  packageOptions: {},
  devOptions: {
    port: 18001,
  },
  buildOptions: {
    out: path.resolve(__dirname, '../packages/browser-extension/build/popup'),
    // webModulesUrl: 'popup/m',
  },
  optimize: {
    entrypoints: ['dist/index.js'],
  },
})
