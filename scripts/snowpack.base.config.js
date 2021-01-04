module.exports = {
  installOptions: {
    sourceMap: true,
    env: {
      NODE_ENV: true,
    },
    treeshake: true,
    // polyfillNode: true
  },
  devOptions: {
    open: 'none',
  },
  buildOptions: {
    out: 'packages/browser-extension/build',
    metaDir: 'snowpackMeta',
    sourceMaps: true,
  },
};
