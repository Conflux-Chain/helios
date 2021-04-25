/* eslint-disable testing-library/no-node-access */

function loadDevJS() {
  const realJS = document.createElement('script')
  realJS.src = 'http://localhost:18002/dist/index.dev.js'
  realJS.type = 'module'
  document.head.appendChild(realJS)
}

window.addEventListener('DomContentLoaded', loadDevJS)
