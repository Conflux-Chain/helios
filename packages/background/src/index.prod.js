// or the regenerator-runtime will throw an error
window.regeneratorRuntime = undefined

if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'))
}

const background = document.createElement('script')
background.src = 'background/dist/index.js'
background.type = 'module'
document.head.appendChild(background)
