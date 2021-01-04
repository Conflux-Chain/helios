const baseConfig = require('./snowpack.base.config');
const {mergeConfig, isDev, mustacheRender} = require('./snowpack.utils');

mustacheRender(
  '../packages/popup/index.html.mustache',
  '../packages/popup/index.html',
  {
    scripts: isDev()
      ? '<script src="http://localhost:18001/popup/dev.js" type="module" charset="utf-8"></script>'
      : '<script src="index.js" type="module" charset="utf-8"></script>',
  },
);

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: 'packages/popup/index.html',
  },
  devOptions: {
    port: 18001,
    fallback: 'packages/popup/index.html',
  },
  buildOptions: {
    // out: "build/popup",
    baseUrl: 'popup',
  },
  mount: {'packages/popup': '/'},
});
