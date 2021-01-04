const baseConfig = require('./snowpack.base.config');
const {mergeConfig} = require('./snowpack.utils');

module.exports = mergeConfig(baseConfig, {
  installOptions: {
    fallback: 'packages/inpage/index.html',
  },
  devOptions: {
    port: 18002,
    fallback: 'packages/inpage/index.html',
  },
  buildOptions: {
    // out: "build/inpage",
    baseUrl: 'inpage',
  },
  mount: {'packages/inpage': '/'},
});
