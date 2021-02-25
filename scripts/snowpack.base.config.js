const path = require('path')

const env = {NODE_ENV: true}

// expose all SNOWPACK_PUBLIC_ env to dependencies
for (const e in process.env) {
  if (e.startsWith('SNOWPACK_PUBLIC_')) {
    env[e] = true
  }
}

module.exports = {
  plugins: ['@snowpack/plugin-dotenv'],
  packageOptions: {
    sourcemap: true,
    env,
    // polyfillNode: true
  },
  devOptions: {
    open: 'none',
  },
  buildOptions: {
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
  },
}
