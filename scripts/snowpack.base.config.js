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
  plugins: [
    '@snowpack/plugin-dotenv',
    path.resolve(__dirname, './snowpack.swc.plugin.js'),
  ],
  mount,
  alias,
  devOptions: {
    hmr: true,
    hmrDelay: 100,
    output: 'stream',
    open: 'none',
  },
  packageOptions: {
    source: 'local',
    env,
    polyfillNode: true,
  },
  buildOptions: {
    clean: true,
    out: path.resolve(__dirname, '../packages/browser-extension/build'),
    sourcemap: true,
    baseUrl: 'dist',
    metaUrlPath: 'sp_',
  },
  optimize: {
    splitting: true,
    minify: true,
    bundle: true,
    treeshake: true,
    sourcemap: 'inline',
  },
}
