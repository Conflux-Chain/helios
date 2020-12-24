module.exports = {
  installOptions: {
    fallback: "background.html",
    sourceMap: true,
    env: {
      NODE_ENV: true,
    },
    treeshake: true,
    // polyfillNode: true
  },
  devOptions: {
    port: 18003,
    fallback: "background.html",
    open: "none",
  },
  buildOptions: {
    // out: "build/background",
    baseUrl: "background",
    metaDir: "snowpackMeta",
    sourceMaps: true,
  },
};
