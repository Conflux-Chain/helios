const {isDev, mustacheRender} = require('./snowpack.utils')

mustacheRender(
  '../packages/browser-extension/manifest.json.mustache',
  '../packages/browser-extension/manifest.json',
  {
    name: isDev() ? 'AHelios' : 'Helios',
    backgroundScripts: isDev()
      ? '"background.dev.js"'
      : '"background/dist/index.prod.js"',
    inpageScripts: isDev() ? '"inpage.dev.js"' : '"inpage/dist/index.js"',
    popupHTML: isDev() ? 'popup.html' : 'popup/index.html',
    contentSecurityPolicy: isDev()
      ? "\"content_security_policy\": \"script-src 'self' 'unsafe-inline' http://localhost:18001 http://localhost:18002 http://localhost:18003; object-src 'self';\","
      : '',
    permissions: isDev()
      ? '"http://localhost:18001/",\n "http://localhost:18002/",\n "http://localhost:18003/",\n'
      : '',
  },
)
