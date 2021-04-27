const path = require('path')
const getWorkspacePackages = require('./get-workspaces-packages')

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
    'browser-extension',
    'helios',
    'helios-background',
    'helios-inpage',
    'helios-popup',
    'workspace-tools',
    'doc',
    '@cfxjs/storybook',
  ],
}).forEach(({location, name}) => {
  const packageAbsPath = path.resolve(__dirname, '../', location)
  mount[packageAbsPath] = {url: `/dist/${name}`}
  alias[name] = packageAbsPath
})

module.exports = {
  workspaceRoot: path.resolve(__dirname, '../'),
  exclude: ['**/node_modules/**', '**/*.cjs'],
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
  },
  buildOptions: {
    clean: true,
    out: path.resolve(__dirname, '../packages/browser-extension/build'),
    sourcemap: false,
    baseUrl: 'dist',
    metaUrlPath: 'sp_',
  },
  // optimize: {
  //   splitting: true,
  //   minify: true,
  //   bundle: true,
  //   treeshake: true,
  //   sourcemap: false,
  // },
  optimize: false,
}
