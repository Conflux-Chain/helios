module.exports = {
  installOptions: {
    fallback: "popup.html",
    sourceMap: true,
    env: {
      NODE_ENV: true,
    },
    treeshake: true,
    // polyfillNode: true
  },
  devOptions: {
    port: 18001,
    fallback: "popup.html",
    open: "none",
  },
  buildOptions: {
    // out: "build/popup",
    baseUrl: "popup",
    metaDir: "snowpackMeta",
    sourceMaps: true,
  },
};
