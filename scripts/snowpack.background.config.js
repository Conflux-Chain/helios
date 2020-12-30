const baseConfig = require("./snowpack.base.config");
const { mergeConfig } = require("./snowpack.utils");

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: "background/background.html",
  },
  devOptions: {
    port: 18003,
    fallback: "background/background.html",
  },
  buildOptions: {
    // out: "build/background",
    baseUrl: "background",
  },
});
