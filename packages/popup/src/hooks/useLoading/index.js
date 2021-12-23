import {useState, useEffect, useRef, useCallback} from 'react'

const createLoadingMap = {
  Page: {
    create: createPageLoading,
    transition: createPageLoadingTransition,
  },
  Spin: {
    create: createSpinLoading,
  },
  Text: {
    create: createTextLoading,
  },
}

let routerDOM = null
let pageLoadingCount = 0 // A flag used to correctly cancel multiple 'Page' type Loading calls that are initiated at the same time.

/**
 * Unified loading func.
 *
 * // Params are not reactive, they should be determined constant at the time of the call.
 * @param {{
 *   type: 'Page'(default) | 'Spin'(TODO:) | 'Text'(TODO:); // The type of loading.
 *   delay?: number; // After the delay(ms, default - 500ms) time is still in the loading state, only then will the animation appear.
 *   targetDOM?: HTMLElement; // Equivalent to the 'ref' in return, one of the two can be chosen('Page' type doesn't have this param), targetDOM priority is higher.
 * }}
 * @returns {{
 *   setLoading: React.Dispatch<React.SetStateAction<boolean>>;
 *   ref?: React.MutableRefObject<HTMLElement>; // Used to attach to the target DOM. 'Page' type doesn't return ref.
 * }}
 *
 * @example use 'Page' type loading. You can safely call 'Page' type Loading any place, any time, any number of times.
 * const { setLoading } = useLoading(); // const { setLoading } = useLoading({ type: 'Page' })
 * somewhere -> setLoading(true) | setLoading(false);
 *
 * @example use 'Spin' type loading with return ref
 * const { setLoading, ref } = useLoading({ type: 'Spin' });
 * in render wrapper dom -> <div ref={ref}></div>
 * somewhere -> setLoading(true) | setLoading(false);
 *
 * @example use 'Spin' type loading with targetDOM
 * const { setLoading } = useLoading({ type: 'Spin', targetDOM: domObj });
 */
const useLoading = (
  {type = 'Page', targetDOM, delay = 500} = {type: 'Page', delay: 500},
) => {
  const [loading, setLoading] = useState(false)
  const loadingStatusRef = useRef(false) // We need a ref to determine if the loading state is still in after a certain time delay.
  useEffect(() => (loadingStatusRef.current = loading), [loading])
  const delayTimerRef = useRef()

  const clearTransitionRef = useRef()
  const loadingEleRef = useRef()
  const clearLoading = useCallback(() => {
    if (!loadingEleRef.current || !isDOMElement(loadingEleRef.current)) return
    loadingEleRef.current.remove()
    loadingEleRef.current = null
    clearTransitionRef.current = null
  }, [])

  const ref = useRef() // ref for return.

  useEffect(() => {
    if (loading) {
      delayTimerRef.current = setTimeout(() => {
        if (!loadingStatusRef.current || loadingEleRef.current) return
        let _targetDOM = document.body
        if (type !== 'Page') {
          _targetDOM = isDOMElement(targetDOM)
            ? targetDOM
            : isDOMElement(ref.current)
            ? ref.current
            : null
        } else {
          _targetDOM =
            routerDOM || (routerDOM = document.querySelector('#router'))
        }

        if (_targetDOM && loading && createLoadingMap[type]) {
          if (type === 'Page' && pageLoadingCount > 0) {
            pageLoadingCount++
            loadingEleRef.current = document.querySelector('.loading-page-mask')
            clearTransitionRef.current =
              createLoadingMap[type].transition(loadingEleRef)
          } else {
            loadingEleRef.current = createLoadingMap[type].create(_targetDOM)
            _targetDOM.append(loadingEleRef.current)
            if (createLoadingMap[type].transition) {
              clearTransitionRef.current =
                createLoadingMap[type].transition(loadingEleRef)
            }

            if (type === 'Page') pageLoadingCount = 1
          }
        }
      }, delay)
    } else {
      if (type === 'Page') {
        pageLoadingCount--
        if (pageLoadingCount > 0) return
      }

      if (typeof delayTimerRef.current === 'number')
        clearTimeout(delayTimerRef.current)

      if (clearTransitionRef.current) clearTransitionRef.current(clearLoading)
      else clearLoading()
    }
  }, [loading])

  if (type === 'Page') {
    return {
      setLoading,
    }
  }

  return {
    setLoading,
    ref,
  }
}

function createPageLoading() {
  const mask = document.createElement('div')
  mask.classList.add('loading-page-mask')
  routerDOM.classList.add('loading-page-mask-blur')

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

function createPageLoadingTransition(loadingEleRef) {
  const wrapperDOM = loadingEleRef.current.querySelector(
    '.loading-page-wrapper',
  )

  setTimeout(() => {
    if (!loadingEleRef.current) return
    loadingEleRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
    if (!wrapperDOM) return
    wrapperDOM.style.opacity = '1'
    wrapperDOM.style.transform = 'scale3d(1, 1, 1)'
  })

  return clearLoading => {
    if (!loadingEleRef.current || !wrapperDOM) return
    wrapperDOM.addEventListener('transitionend', clearLoading)
    loadingEleRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0)'
    wrapperDOM.style.opacity = '0'
    wrapperDOM.style.transform = 'scale3d(0, 1, .1)'
    routerDOM.classList.remove('loading-page-mask-blur')
  }
}

function createSpinLoading() {
  const wrapper = document.createElement('div')
  return wrapper
}

function createTextLoading() {
  const wrapper = document.createElement('div')
  return wrapper
}

function isDOMElement(ele) {
  try {
    return ele instanceof HTMLElement
  } catch (e) {
    return (
      typeof ele === 'object' &&
      ele.nodeType === 1 &&
      typeof ele.style === 'object' &&
      typeof ele.ownerDocument === 'object'
    )
  }
}

export default useLoading
