const baseConfig = require('./snowpack.base.config');
const {mergeConfig} = require('./snowpack.utils');

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: 'packages/background/index.html',
  },
  devOptions: {
    port: 18003,
    fallback: 'packages/background/index.html',
  },
  buildOptions: {
    // out: "build/background",
    webModulesUrl: 'background/m',
    baseUrl: 'background',
  },
  mount: {'packages/background': '/background'},
});
