import './createSpinLoading.css'
import {validBlur} from './index'

export function createSpinLoading({targetDOM, size, showBlur}) {
  const mask = document.createElement('div')
  mask.classList.add('loading-mask')
  if (validBlur[showBlur] && showBlur !== 'none') {
    targetDOM.classList.add(`loading-mask-blur-${showBlur}`)
  }

  let _size = parseInt(size)
  if (isNaN(_size)) {
    const targetDOMWidth = getComputedStyle(targetDOM).width
    _size = parseInt(targetDOMWidth) / 5
  }

  mask.insertAdjacentHTML(
    'afterbegin',
    `
        <div class="loading-spin" style="font-size:${_size}px;">
            <div class="loading-spin-dot loading-spin-dot1"></div>
            <div class="loading-spin-dot loading-spin-dot2"></div>
            <div class="loading-spin-dot loading-spin-dot3"></div>
        </div>
      `,
  )

  return mask
}

export function createSpinLoadingTransition({targetDOM, loadingEle}) {
  if (!loadingEle) return
  const wrapperDOM = loadingEle.querySelector('.loading-spin')

  setTimeout(() => {
    if (!loadingEle) return
    loadingEle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
    if (!wrapperDOM) return
    wrapperDOM.style.opacity = '1'
  })

  return clearLoading => {
    if (!loadingEle || !wrapperDOM) return
    wrapperDOM.addEventListener('transitionend', clearLoading)
    setTimeout(clearLoading, 200)
    loadingEle.style.backgroundColor = 'rgba(255, 255, 255, 0)'
    wrapperDOM.style.opacity = '0'
    if (!targetDOM) return
    targetDOM.classList.remove(
      ...Object.keys(validBlur).map(blur => `loading-mask-blur-${blur}`),
    )
    delete targetDOM.dataset.blur
  }
}
