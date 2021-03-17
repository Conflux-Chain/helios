const {isDev, mustacheRender} = require('./snowpack.utils')

mustacheRender(
  '../packages/browser-extension/manifest.json.mustache',
  '../packages/browser-extension/manifest.json',
  {
    contentSecurityPolicy: isDev()
      ? `
"content_security_policy": "
default-src 'self';
script-src 'self' 'unsafe-eval' http://localhost:18001 http://localhost:18002 http://localhost:18003;
connect-src * data: blob: filesystem:;
style-src 'self' data: chrome-extension-resource: 'unsafe-inline';
img-src 'self' data: chrome-extension-resource:;
frame-src 'self' http://localhost:* data: chrome-extension-resource:;
font-src 'self' data: chrome-extension-resource:;
media-src * data: blob: filesystem:;",`.replaceAll('\n', ' ')
      : '',
    name: isDev() ? 'AHelios' : 'Helios',
    backgroundScripts: isDev()
      ? '"background.dev.js"'
      : '"background/dist/index.prod.js"',
    inpageScripts: isDev() ? '"inpage.dev.js"' : '"inpage/dist/index.js"',
    popupHTML: isDev() ? 'popup.html' : 'popup/index.html',
    permissions: isDev()
      ? '"http://localhost:18001/",\n "http://localhost:18002/",\n "http://localhost:18003/",\n'
      : '',
  },
)
