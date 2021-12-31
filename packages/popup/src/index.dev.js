/* eslint-disable testing-library/no-node-access */
window.HMR_WEBSOCKET_URL = 'ws://localhost:18001'

if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'))
}

const hmrClient = document.createElement('script')
hmrClient.src = 'http://localhost:18001/sp_/hmr-client.js'
hmrClient.type = 'module'
document.head.appendChild(hmrClient)

const hmrErrorOverlay = document.createElement('script')
hmrErrorOverlay.src = 'http://localhost:18001/sp_/hmr-error-overlay.js'
hmrErrorOverlay.type = 'module'
document.head.appendChild(hmrErrorOverlay)

const popup = document.createElement('script')
popup.src = 'http://localhost:18001/dist/index.js'
popup.type = 'module'
document.head.appendChild(popup)
