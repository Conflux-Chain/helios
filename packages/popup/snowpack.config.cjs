const baseConfig = require('../../scripts/snowpack.base.config.js')
const {
  mergeConfig,
  isDev,
  mustacheRender,
} = require('../../scripts/snowpack.utils.js')
const path = require('path')

;['popup', 'notification', 'page'].forEach(templateName =>
  mustacheRender(
    path.resolve(__dirname, `./public/${templateName}.html.mustache`),
    isDev()
      ? path.resolve(__dirname, `../browser-extension/${templateName}.html`)
      : path.resolve(
          __dirname,
          `../browser-extension/build/popup/${templateName}.html`,
        ),
    {
      scripts: isDev()
        ? `<script src="http://localhost:18001/dist/index.dev.js" type="module" charset="utf-8"></script>`
        : `<link rel="stylesheet" href="dist/index.css" type="text/css" media="screen" />
<script src="dist/index.js" type="module" charset="utf-8"></script>`,
      body: ``,
    },
  ),
)

const root = __dirname

const mergedConfig = mergeConfig(baseConfig, {
  root,
  mount: {
    [path.resolve(root, './public')]: {url: '/', static: true},
    [path.resolve(root, './src')]: {url: '/dist'},
  },
  routes: [...baseConfig.routes],
  plugins: [
    ...baseConfig.plugins,
    '@snowpack/plugin-postcss',
    [
      path.resolve(
        baseConfig.workspaceRoot,
        './scripts/snowpack.swc.frontend.plugin.js',
      ),
      {},
    ],
  ],
  devOptions: {
    port: 18001,
  },
  buildOptions: {
    cacheDirPath: path.resolve(
      __dirname,
      '../../node_modules/.cache/snowpack-popup',
    ),
    out: path.resolve(root, '../browser-extension/build/popup'),
    // webModulesUrl: 'popup/m',
  },
  packageOptions: {
    ...baseConfig.packageOptions,
    knownEntrypoints: [
      ...baseConfig.packageOptions.knownEntrypoints,
      'js-sha3',
      'ethjs-util',
      'rc-util/es/raf',
      'rc-util/es/ref',
      'rc-util/es/Portal',
      'rc-util/es/isMobile',
      'rc-util/es/createChainedFunction',
      'rc-util/es/Dom/addEventListener',
      'rc-util/es/Dom/contains',
      'rc-util/es/Dom/findDOMNode',
      'rc-util/es/Dom/isVisible',
      'rc-util/es/Dom/canUseDom',
      'node-fetch',
      ...(isDev()
        ? [
            'prop-types',
            'react/jsx-dev-runtime',
            'rc-util/es/hooks/useMergedState',
          ]
        : []),
    ],
    cache: '.snowpack-popup',
  },
  optimize: {
    entrypoints: ['dist/index.js'],
  },
})

const shouldExcludeInPopup = path => {
  return /packages\/(rpcs|db|spec)/.test(path)
}

mergedConfig.mount = Object.entries(mergedConfig.mount).reduce(
  (acc, [k, v]) => {
    if (shouldExcludeInPopup(k)) return acc
    acc[k] = v
    return acc
  },
  {},
)

module.exports = mergedConfig
