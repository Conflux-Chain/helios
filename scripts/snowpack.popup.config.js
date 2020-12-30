const baseConfig = require("./snowpack.base.config");
const { mergeConfig, isDev, mustacheRender } = require("./snowpack.utils");

mustacheRender("../app/popup/popup.html.mustache", "../app/popup/popup.html", {
  scripts: isDev()
    ? '<script src="http://localhost:18001/popup/dev.js" type="module" charset="utf-8"></script>'
    : '<script src="index.js" type="module" charset="utf-8"></script>',
});

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: "popup/popup.html",
  },
  devOptions: {
    port: 18001,
    fallback: "popup/popup.html",
  },
  buildOptions: {
    // out: "build/popup",
    baseUrl: "popup",
  },
});
