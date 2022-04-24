const setupDotenv = require('../setup-dotenv.js')
setupDotenv(true)
const NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill')
const browserslist = require('browserslist')
const {esbuildPluginBrowserslist} = require('esbuild-plugin-browserslist')
const browserLists = require('../../package.json').browserslist
const alias = require('esbuild-plugin-alias')
const {pnpPlugin} = require('@yarnpkg/esbuild-plugin-pnp')
const esb = require('esbuild')
const path = require('path')
const {isProd} = require('../snowpack.utils.js')
const fs = require('fs')

const config = {
  entryPoints: [
    ...(isProd() ? [] : ['packages/background/src/index.dev.js']),
    'packages/background/src/index.js',
  ],
  define: Object.entries(process.env).reduce(
    (acc, [k, v]) => {
      if (k.startsWith('SNOWPACK_PUBLIC_'))
        acc[`import.meta.env.${k}`] = JSON.stringify(v)
      return acc
    },
    {
      'import.meta.env.SNOWPACK_PUBLIC_FLUENT_ENV': JSON.stringify(
        process.env.NODE_ENV,
      ),
      'import.meta.env.SNOWPACK_PUBLIC_SENTRY_DSN': null,
      'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'import.meta.env.CI': JSON.stringify(process.env.CI),
    },
  ),
  inject: ['scripts/build/buffer-shim.js'],
  logLevel: isProd() ? 'warning' : 'error',
  bundle: true,
  write: true,
  treeShaking: true,
  platform: 'browser',
  splitting: true,
  minify: isProd(),
  sourcemap: isProd() ? true : 'inline',
  // sourcemap: isProd() ? 'inline' : true,
  format: 'esm',
  outdir: 'packages/browser-extension/build/background/dist',
  plugins: [
    ...(isProd()
      ? [
          esbuildPluginBrowserslist(browserslist(browserLists), {
            printUnknownTargets: false,
          }),
        ]
      : []),
    pnpPlugin(),
    alias({
      jsbi: path.resolve(__dirname, '../../node_modules/jsbi/dist/jsbi-cjs.js'),
    }),
    NodeModulesPolyfills.default(),
  ],
}

function buildIndexProd() {
  return esb.build({
    ...config,
    entryPoints: ['packages/background/src/index.prod.js'],
    splitting: false,
    format: undefined,
  })
}

function analyze() {
  return Promise.all([
    esb
      .build({...config, metafile: true})
      .then(x => esb.analyzeMetafile(x.metafile, {verbose: true}))
      .then(x => fs.writeFileSync('bg-report.txt', x)),
    buildIndexProd(),
  ])
}

// eslint-disable-next-line no-unused-vars
function build() {
  return Promise.all([esb.build(config), buildIndexProd()])
}

// eslint-disable-next-line no-unused-vars
function serve() {
  return esb.serve(
    {servedir: 'packages/browser-extension/', port: 18003},
    config,
  )
}

module.exports = {analyze, build, serve}

// serve()
// build()
// analyze()
