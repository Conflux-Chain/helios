import './createSpinLoading.css'

export function createSpinLoading(targetDOM, size) {
  const mask = document.createElement('div')
  mask.classList.add('loading-mask')
  targetDOM.classList.add('loading-mask-blur')

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

export function createSpinLoadingTransition(targetDOM, loadingEleRef) {
  const wrapperDOM = loadingEleRef.current.querySelector('.loading-spin')

  setTimeout(() => {
    if (!loadingEleRef.current) return
    loadingEleRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
    if (!wrapperDOM) return
    wrapperDOM.style.opacity = '1'
  })

  return clearLoading => {
    if (!loadingEleRef.current || !wrapperDOM) return
    wrapperDOM.addEventListener('transitionend', clearLoading)
    loadingEleRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0)'
    wrapperDOM.style.opacity = '0'
    targetDOM.classList.remove('loading-mask-blur')
  }
}
