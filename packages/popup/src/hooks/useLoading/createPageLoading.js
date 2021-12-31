import './createPageLoading.css'
import {validBlur} from './index'

export function createPageLoading({targetDOM, showBlur}) {
  const mask = document.createElement('div')
  mask.classList.add('loading-mask')
  if (validBlur[showBlur] && showBlur !== 'none') {
    targetDOM.classList.add(`loading-mask-blur-${showBlur}`)
  }

  mask.insertAdjacentHTML(
    'afterbegin',
    `
          <div class="loading-page-wrapper">
              <div class="loading-page-inner">
                  <svg width="48" height="48" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M480 77.287V0H227.797C101.988 0 0 101.987 0 227.794V479.997h50.75l50.263.003a.918.918 0 0 0 .02-.003h2.004C180.666 467.651 240 400.411 240 319.315v-79.307h-2.034v-.015l79.322.004 2.691-.022C408.601 238.538 480 166.251 480 77.287z" fill="#fff" fill-opacity=".8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M376.928 0h103.038v77.28c0 91.531-72.605 162.695-162.05 162.695l-2.691.022-75.259-.008v-79.307C239.966 79.586 299.3 12.346 376.928 0z" fill="#242265" fill-opacity=".8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M480 77.287V0H227.797C101.988 0 0 101.987 0 227.794V479.997h50.75l50.263.003a.918.918 0 0 0 .02-.003h2.004C180.666 467.651 240 400.411 240 319.315v-79.307h-2.034v-.015l79.322.004 2.691-.022C408.601 238.538 480 166.251 480 77.287z" fill="#616EE1" fill-opacity=".8"/></svg>
                  <div class="loading-page-line"></div>
              </div>
          </div>
      `,
  )

  return mask
}

export function createPageLoadingTransition({targetDOM, loadingEle}) {
  if (!loadingEle) return
  const wrapperDOM = loadingEle.querySelector('.loading-page-wrapper')

  setTimeout(() => {
    if (!loadingEle) return
    loadingEle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
    if (!wrapperDOM) return
    wrapperDOM.style.opacity = '1'
    wrapperDOM.style.transform = 'scale3d(1, 1, 1)'
  })

  return clearLoading => {
    if (!loadingEle || !wrapperDOM) return
    wrapperDOM.style.transition = 'all 125ms ease'
    wrapperDOM.addEventListener('transitionend', clearLoading)
    setTimeout(clearLoading, 200)
    loadingEle.style.backgroundColor = 'rgba(255, 255, 255, 0)'
    wrapperDOM.style.opacity = '0'
    // wrapperDOM.style.transform = 'scale3d(0, 1, .1)'
    if (!targetDOM) return
    targetDOM.classList.remove(
      ...Object.keys(validBlur).map(blur => `loading-mask-blur-${blur}`),
    )
    delete targetDOM.dataset.blur
  }
}
