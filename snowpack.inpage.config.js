module.exports = {
  installOptions: {
    fallback: "inpage.html",
    sourceMap: true,
    env: {
      NODE_ENV: true,
    },
    treeshake: true,
    // polyfillNode: true
  },
  devOptions: {
    port: 18002,
    fallback: "inpage.html",
    open: "none",
  },
  buildOptions: {
    // out: "build/inpage",
    baseUrl: "inpage",
    metaDir: "snowpackMeta",
    sourceMaps: true,
  },
};
