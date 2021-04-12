/* eslint-disable testing-library/no-node-access */
window.HMR_WEBSOCKET_URL = 'ws://localhost:18002'

if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'))
}

const hmrClient = document.createElement('script')
hmrClient.src = 'http://localhost:18002/sp_/hmr-client.js'
hmrClient.type = 'module'
document.head.appendChild(hmrClient)

const hmrErrorOverlay = document.createElement('script')
hmrErrorOverlay.src = 'http://localhost:18002/sp_/hmr-error-overlay.js'
hmrErrorOverlay.type = 'module'
document.head.appendChild(hmrErrorOverlay)

const background = document.createElement('script')
background.src = 'http://localhost:18002/dist/index.js'
background.type = 'module'
document.head.appendChild(background)
