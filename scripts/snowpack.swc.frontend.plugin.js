/**
 * @fileOverview snowpack plugin for building frontend code
 * @name snowpack.swc.frontend.plugin.js
 */
const swc = require('@swc/core')
const path = require('path')
const fs = require('fs')

const root = path.resolve(__dirname, '..')

const reactRefreshLoc = require.resolve(
  'react-refresh/cjs/react-refresh-runtime.development.js',
)
const reactRefreshCode = fs
  .readFileSync(reactRefreshLoc, {encoding: 'utf-8'})
  .replace(`process.env.NODE_ENV`, JSON.stringify('development'))

module.exports = function (/* snowpackConfig, pluginOptions */) {
  return {
    name: 'helios-snowpack-swc-frontend-plugin',
    // resolve: {
    //   input: ['.js', '.jsx'],
    //   output: ['.js'],
    // },
    transform({contents, fileExt, id}) {
      if (fileExt !== '.js' && fileExt !== '.jsx') return
      // add code for react hmr
      if (id.endsWith('/packages/popup/src/index.dev.js'))
        contents =
          `function debounce(e,t){let u;return()=>{clearTimeout(u),u=setTimeout(e,t)}}
  {
    const exports = {};
    ${reactRefreshCode}
    exports.performReactRefresh = debounce(exports.performReactRefresh, 30);
    window.$RefreshRuntime$ = exports;
    window.$RefreshRuntime$.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
  }
` +
          '\n' +
          contents
      return swc.transformSync(contents, {
        cwd: root,
        root,
        filename: id,
        sourceMaps: 'inline',
      }).code
    },
    // load(a, b, c) {
    //   console.log(a, b, c)
    //   throw new Error('kkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
    //   debugger
    // },
  }
}
