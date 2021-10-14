const path = require('path')
const getWorkspacePackages = require('./get-workspaces-packages')
const {isProd} = require('./snowpack.utils.js')

const env = {NODE_ENV: true}

// expose all SNOWPACK_PUBLIC_ env to dependencies
for (const e in process.env) {
  if (e.startsWith('SNOWPACK_PUBLIC_')) {
    env[e] = true
  }
}

const mount = {}
const alias = {}
getWorkspacePackages({
  ignore: [
    '@fluent-wallet/contract-method-name',
    'browser-extension',
    'helios',
    'helios-background',
    'helios-inpage',
    'helios-popup',
    'workspace-tools',
    'doc',
    'ext-reload',
    '@fluent-wallet/jest-helper',
    '@fluent-wallet/test-helpers',
    '@fluent-wallet/content-script',
  ],
}).forEach(({location, name}) => {
  const packageAbsPath = path.resolve(__dirname, '../', location)
  mount[packageAbsPath] = {url: `/dist/${name}`}
  alias[name] = packageAbsPath
})

module.exports = {
  workspaceRoot: path.resolve(__dirname, '../'),
  exclude: [
    '**/node_modules/**',
    '**/*.cjs',
    '**/*.cljs',
    '**/*.cljc',
    '**/*.md',
  ],
  mount,
  routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
  alias,
  plugins: [
    '@snowpack/plugin-dotenv',
    path.resolve(__dirname, './snowpack.swc.plugin.js'),
  ],
  devOptions: {
    secure: false,
    hostname: 'localhost',
    open: 'none',
    output: 'stream',
    hmr: true,
    hmrDelay: 100,
  },
  packageOptions: {
    source: 'local',
    env,
    polyfillNode: true,
    packageLookupFields: ['browser'],
    packageExportLookupFields: ['exports'],
  },
  buildOptions: {
    clean: true,
    out: path.resolve(__dirname, '../packages/browser-extension/build'),
    baseUrl: 'dist',
    metaUrlPath: 'sp_',
  },
  optimize: isProd()
    ? {
        souecemap: 'inline',
        // bundle: true, // TODO: turn this on after https://github.com/snowpackjs/snowpack/issues/3403 is resolved
        minify: true,
        target: 'es2020',
        treeshake: true,
        splitting: true,
      }
    : false,
}
