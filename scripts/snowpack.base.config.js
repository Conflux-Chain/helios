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
    open: "none",
  },
  buildOptions: {
    metaDir: "snowpackMeta",
    sourceMaps: true,
    webModulesUrl: "m",
  },
  mount: { app: "/" },
};
