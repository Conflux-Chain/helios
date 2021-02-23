const path = require('path')

module.exports = {
  plugins: ['@snowpack/plugin-dotenv'],
  packageOptions: {
    sourcemap: true,
    env: {
      NODE_ENV: true,
    },
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
