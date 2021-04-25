const baseConfig = require('../../scripts/snowpack.base.config.js')
const {
  mergeConfig,
  isDev,
  mustacheRender,
} = require('../../scripts/snowpack.utils.js')
const path = require('path')

mustacheRender(
  path.resolve(__dirname, './public/index.html.mustache'),
  isDev()
    ? path.resolve(__dirname, '../browser-extension/popup.html')
    : path.resolve(__dirname, './public/index.html'),
  {
    scripts: isDev()
      ? `<script src="http://localhost:18001/dist/index.dev.js" type="module" charset="utf-8"></script>`
      : `<script src="dist/index.js" type="module" charset="utf-8"></script>`,
    body: ``,
  },
)

const root = __dirname

module.exports = mergeConfig(baseConfig, {
  cacheDir: 'snowpack-popup',
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
  plugins: [
    ...baseConfig.plugins,
    [
      path.resolve(
        baseConfig.workspaceRoot,
        './scripts/snowpack.postcss.plugin.js',
      ),
      {},
    ],
    [
      path.resolve(
        baseConfig.workspaceRoot,
        './scripts/snowpack.swc.frontend.plugin.js',
      ),
      {},
    ],
    '@snowpack/plugin-react-refresh',
  ],
  packageOptions: {},
  devOptions: {
    port: 18001,
  },
  buildOptions: {
    out: path.resolve(root, '../browser-extension/build/popup'),
    // webModulesUrl: 'popup/m',
  },
  optimize: {
    entrypoints: ['dist/index.js'],
  },
})
