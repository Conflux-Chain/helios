/**
 * @fileOverview snowpack plugin for building frontend code
 * @name snowpack.swc.frontend.plugin.js
 */
const swc = require('@swc/core')
const path = require('path')
const {isProd} = require('./snowpack.utils.js')
const fs = require('fs')
const {isDev} = require('./snowpack.utils.js')

const root = path.resolve(__dirname, '..')

const reactRefreshLoc = require.resolve(
  'react-refresh/cjs/react-refresh-runtime.development.js',
)
const reactRefreshCode = fs
  .readFileSync(reactRefreshLoc, {encoding: 'utf-8'})
  .replace(`process.env.NODE_ENV`, JSON.stringify('development'))

const IS_FAST_REFRESH_ENABLED = /\$RefreshReg\$\(/

function transformJs(id, contents) {
  let fastRefreshEnhancedCode

  if (IS_FAST_REFRESH_ENABLED.test(contents)) {
    // Warn in case someone has a bad setup, and to help older users upgrade.
    console.warn(
      `[@snowpack/plugin-react-refresh] ${id}\n"react-refresh/babel" plugin no longer needed in your babel config, safe to remove.`,
    )
    fastRefreshEnhancedCode = contents
  } else {
    const {code} = swc.transformSync(contents, {
      cwd: root,
      root,
      filename: id,
      configFile: path.resolve(
        __dirname,
        isProd() ? './prod.swcrc.json' : './devreact.swcrc.json',
      ),
      sourceMaps: isProd() ? false : 'inline',
    })
    fastRefreshEnhancedCode = code
  }

  // If fast refresh markup wasn't added, just return the original content.
  if (
    !fastRefreshEnhancedCode ||
    !IS_FAST_REFRESH_ENABLED.test(fastRefreshEnhancedCode)
  ) {
    return contents
  }

  return `
/** React Refresh: Setup **/
if (import.meta.hot) {
  if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
    console.warn('@snowpack/plugin-react-refresh: HTML setup script not run. React Fast Refresh only works when Snowpack serves your HTML routes. You may want to remove this plugin.');
  } else {
    var prevRefreshReg = window.$RefreshReg$;
    var prevRefreshSig = window.$RefreshSig$;
    window.$RefreshReg$ = (type, id) => {
      window.$RefreshRuntime$.register(type, ${JSON.stringify(id)} + " " + id);
    }
    window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
  }
}

${fastRefreshEnhancedCode}

/** React Refresh: Connect **/
if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg
  window.$RefreshSig$ = prevRefreshSig
  import.meta.hot.accept(() => {
    window.$RefreshRuntime$.performReactRefresh()
  });
}`
}
module.exports = function (/* snowpackConfig, pluginOptions */) {
  return {
    name: 'helios-snowpack-swc-frontend-plugin',
    transform({contents, fileExt, id}) {
      if (!isDev()) return
      if (fileExt !== '.js' && fileExt !== '.jsx') return
      if (id.includes('js-conflux-sdk')) return
      if (id.includes('web3-eth-contract/node_modules/util/util.js')) return
      // add code for react hmr
      const devJSFile = id.endsWith('/packages/popup/src/index.dev.js')
      if (devJSFile) {
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
        return contents
      }
      return transformJs(id, contents)
    },
  }
}
