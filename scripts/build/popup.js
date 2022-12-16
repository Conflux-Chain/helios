require('../setup-dotenv.js')
const NodeModulesPolyfills = require('@cztocm/node-modules-polyfill')
const browserslist = require('browserslist')
const {esbuildPluginBrowserslist} = require('esbuild-plugin-browserslist')
const browserLists = require('../../package.json').browserslist
const {pnpPlugin} = require('@yarnpkg/esbuild-plugin-pnp')
const esb = require('esbuild')
const stylePlugin = require('esbuild-style-plugin')
const fs = require('fs')
const {isProd} = require('../snowpack.utils.js')

const config = {
  entryPoints: [
    ...(isProd() ? [] : ['packages/popup/src/index.dev.js']),
    'packages/popup/src/index.js',
  ],
  define: Object.entries(process.env).reduce(
    (acc, [k, v]) => {
      if (k.startsWith('SNOWPACK_PUBLIC_'))
        acc[`import.meta.env.${k}`] = JSON.stringify(v)
      return acc
    },
    {
      'import.meta.env.SNOWPACK_PUBLIC_SENTRY_DSN': null,
      'import.meta.env.SNOWPACK_PUBLIC_FLUENT_ENV': JSON.stringify(
        process.env.NODE_ENV,
      ),
      'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'import.meta.env.CI': JSON.stringify(process.env.CI),
    },
  ),
  inject: ['scripts/build/buffer-shim.js', 'scripts/build/react-shim.js'],
  loader: {'.js': 'jsx', '.png': 'dataurl', '.svg': 'dataurl'},
  bundle: true,
  write: true,
  treeShaking: true,
  platform: 'browser',
  splitting: true,
  format: 'esm',
  outdir: 'packages/browser-extension/build/popup/dist',
  external: ['*.png', '*.svg'],
  minify: isProd(),
  sourcemap: true,
  // sourcemap: isProd() ? 'inline' : true,
  plugins: [
    esbuildPluginBrowserslist(browserslist(browserLists), {
      printUnknownTargets: false,
    }),
    pnpPlugin(),
    NodeModulesPolyfills.default(),
    stylePlugin({
      postcssConfigFile: true,
    }),
  ],
}

// eslint-disable-next-line no-unused-vars
function build() {
  return esb.build(config)
}

// eslint-disable-next-line no-unused-vars
function serve() {
  return esb.serve(
    {servedir: 'packages/browser-extension/', port: 18001},
    config,
  )
}

function analyze() {
  return esb
    .build({...config, metafile: true})
    .then(x => esb.analyzeMetafile(x.metafile, {verbose: true}))
    .then(x => fs.writeFileSync('popup-report.txt', x))
}

module.exports = analyze
