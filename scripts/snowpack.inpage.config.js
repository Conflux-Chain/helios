const baseConfig = require("./snowpack.base.config");
const { mergeConfig } = require("./snowpack.utils");

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: "inpage/inpage.html",
  },
  devOptions: {
    port: 18002,
    fallback: "inpage/inpage.html",
  },
  buildOptions: {
    // out: "build/inpage",
    baseUrl: "inpage",
  },
});
