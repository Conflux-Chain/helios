/* eslint-disable testing-library/no-node-access */
window.HMR_WEBSOCKET_URL = 'ws://localhost:18002'

function loadDevJS() {
  const hmrClient = document.createElement('script')
  hmrClient.src = 'http://localhost:18002/sp_/hmr-client.js'
  hmrClient.type = 'module'
  document.head.appendChild(hmrClient)

  const hmrErrorOverlay = document.createElement('script')
  hmrErrorOverlay.src = 'http://localhost:18002/sp_/hmr-error-overlay.js'
  hmrErrorOverlay.type = 'module'
  document.head.appendChild(hmrErrorOverlay)

  const main = document.createElement('script')
  main.src = 'http://localhost:18002/dist/index.js'
  main.type = 'module'
  document.head.appendChild(main)
}

window.addEventListener('DomContentLoaded', loadDevJS)
