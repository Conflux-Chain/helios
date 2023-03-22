const {isDev, mustacheRender} = require('./snowpack.utils')
const path = require('path')
const {ensureDirSync} = require('fs-extra')

const extDir = path.resolve(__dirname, '../packages/browser-extension')

ensureDirSync(path.resolve(extDir, 'build'))
ensureDirSync(path.resolve(extDir, 'build/popup'))
ensureDirSync(path.resolve(extDir, 'build/background'))

const version = process.env.SNOWPACK_PUBLIC_FLUENT_VERSION

mustacheRender(
  path.resolve(extDir, 'manifest.json.mustache'),
  isDev()
    ? path.resolve(extDir, 'manifest.json')
    : path.resolve(extDir, 'build/manifest.json'),
  {
    version: version.replace('-rc', ''),
    versionName: version,
    contentSecurityPolicy: isDev()
      ? `
"content_security_policy": "
object-src 'self' 'unsafe-eval' http://localhost:18001 http://localhost:18002 http://localhost:18003;
script-src 'self' 'unsafe-eval' http://localhost:18001 http://localhost:18002 http://localhost:18003;
connect-src * data: blob: filesystem:;
style-src 'self' data: chrome-extension-resource: 'unsafe-inline';
frame-src 'self' http://localhost:* data: chrome-extension-resource:;
font-src 'self' data: chrome-extension-resource:;
media-src * data: blob: filesystem:;",`.replaceAll('\n', ' ')
      : `"content_security_policy": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"`,
    name: isDev() ? 'AFluent' : '__MSG_extensionNAME__',
    backgroundScripts: isDev()
      ? '"reload.js","background.dev.js"'
      : '"background/dist/index.prod.js"',
    contentScripts: '"content-script.js"',
    webResources: '"content-script.js","inpage.js"',
    popupHTML: isDev() ? 'popup.html' : 'popup/popup.html',
    permissions: isDev() ? '"<all_urls>",\n  "tabs",\n' : '',
  },
)
