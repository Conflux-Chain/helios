/* eslint-disable testing-library/no-node-access */
if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'))
}

const realJS = document.createElement('script')
realJS.src = 'http://localhost:18003/build/background/dist/index.dev.js'
realJS.type = 'module'
document.head.appendChild(realJS)
