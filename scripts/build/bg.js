const setupDotenv = require('../setup-dotenv.js')
setupDotenv(true)
const NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill')
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
      'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'import.meta.env.CI': JSON.stringify(process.env.CI),
    },
  ),
  inject: ['scripts/build/buffer-shim.js'],
  bundle: true,
  write: true,
  treeShaking: true,
  platform: 'browser',
  splitting: true,
  minify: isProd(),
  sourcemap: true,
  // sourcemap: isProd() ? 'inline' : true,
  format: 'esm',
  outdir: 'packages/browser-extension/build/background/dist',
  plugins: [
    pnpPlugin(),
    alias({
      jsbi: path.resolve(__dirname, '../../node_modules/jsbi/dist/jsbi-cjs.js'),
    }),
    NodeModulesPolyfills.default(),
  ],
}

function analyze() {
  return esb
    .build({...config, metafile: true})
    .then(x => esb.analyzeMetafile(x.metafile, {verbose: true}))
    .then(x => fs.writeFileSync('bg-report.txt', x))
}

// eslint-disable-next-line no-unused-vars
function build() {
  return esb.build(config)
}

// eslint-disable-next-line no-unused-vars
function serve() {
  return esb.serve(
    {servedir: 'packages/browser-extension/', port: 18003},
    config,
  )
}

module.exports = analyze

// serve()
// build()
// analyze()
