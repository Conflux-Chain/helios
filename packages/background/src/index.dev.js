/* eslint-disable testing-library/no-node-access */
// or the regenerator-runtime will throw an error
// window.regeneratorRuntime = undefined
// window.HMR_WEBSOCKET_URL = 'ws://localhost:18003'

if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'))
}
if (!document.body) {
  document.querySelector('html').appendChild(document.createElement('body'))
}

// const hmrClient = document.createElement('script')
// hmrClient.src = 'http://localhost:18003/sp_/hmr-client.js'
// hmrClient.type = 'module'
// document.head.appendChild(hmrClient)

const background = document.createElement('script')
background.src = 'http://localhost:18003/background-script.js'
background.type = 'module'
document.body.appendChild(background)
