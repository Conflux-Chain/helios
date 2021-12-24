import {useState, useEffect, useRef, useCallback} from 'react'
import {
  createPageLoading,
  createPageLoadingTransition,
} from './createPageLoading'
import {
  createSpinLoading,
  createSpinLoadingTransition,
} from './createSpinLoading'

const createLoadingMap = {
  Page: {
    create: createPageLoading,
    transition: createPageLoadingTransition,
  },
  Spin: {
    create: createSpinLoading,
    transition: createSpinLoadingTransition,
  },
}

export let routerDOM = null
let pageLoadingCount = 0 // A flag used to correctly cancel multiple 'Page' type Loading calls that are initiated at the same time.

/**
 * Unified loading func.
 *
 * // Params are not reactive, they should be determined constant at the time of the call.
 * @param {{
 *   type: 'Page'(default) | 'Spin' | 'LocalSpin'(TODO:); // The type of loading.
 *   delay?: number; // After the delay(ms, default - 0) time is still in the loading state, only then will the animation appear.If the delay value is less than 100, it will be ignored.
 *   targetDOM?: HTMLElement; // Equivalent to the 'ref' in return, one of the two can be chosen('Page' type doesn't have this param), targetDOM priority is higher.
 *   size?: number; // Valid only in Spin Loading.'px' size of box;If not set, will adapt to the targetDOM's width.
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
 * const { setLoading, ref } = useLoading({ type: 'Spin' }); // useLoading({ type: 'Spin', size: 100 })
 * in render wrapper dom -> <div ref={ref}></div>
 * somewhere -> setLoading(true) | setLoading(false);
 *
 * @example use 'Spin' type loading with targetDOM
 * const { setLoading } = useLoading({ type: 'Spin', targetDOM: domObj });
 *
 */
const useLoading = (
  {type = 'Page', targetDOM, delay = 0, size} = {type: 'Page', delay: 0},
) => {
  const [loading, setLoading] = useState(false)
  const loadingStatusRef = useRef(false) // We need a ref to determine if the loading state is still in after a certain time delay.
  useEffect(() => (loadingStatusRef.current = loading), [loading])
  const delayTimerRef = useRef()

  const clearTransitionRef = useRef()
  const loadingEleRef = useRef()
  const clearLoading = useCallback(targetDOM => {
    if (!loadingEleRef.current || !isDOMElement(loadingEleRef.current)) return
    loadingEleRef.current.remove()
    loadingEleRef.current = null
    clearTransitionRef.current = null
    resetTargetDOMPosition(targetDOM)
  }, [])

  const ref = useRef() // ref for return.

  useEffect(() => {
    let _targetDOM = document.body
    if (type !== 'Page') {
      _targetDOM = isDOMElement(targetDOM)
        ? targetDOM
        : isDOMElement(ref.current)
        ? ref.current
        : null
    } else {
      _targetDOM = routerDOM || (routerDOM = document.querySelector('#router'))
    }

    if (loading) {
      const startLoading = () => {
        if (_targetDOM && loading && createLoadingMap[type]) {
          if (type === 'Page' && pageLoadingCount > 0) {
            pageLoadingCount++
            loadingEleRef.current = document.querySelector('.loading-page-mask')
            clearTransitionRef.current =
              createLoadingMap[type].transition(loadingEleRef)
          } else {
            loadingEleRef.current = createLoadingMap[type].create({
              targetDOM: _targetDOM,
              size,
            })

            checkTargetDOMPosition(_targetDOM)
            _targetDOM.append(loadingEleRef.current)
            if (createLoadingMap[type].transition)
              clearTransitionRef.current = createLoadingMap[type].transition({
                targetDOM: _targetDOM,
                loadingEle: loadingEleRef.current,
              })

            if (type === 'Page') pageLoadingCount = 1
          }
        }
      }

      if (delay < 100) startLoading()
      else {
        delayTimerRef.current = setTimeout(() => {
          if (!loadingStatusRef.current || loadingEleRef.current) return
          startLoading()
        }, delay)
      }
    } else {
      if (type === 'Page') {
        pageLoadingCount--
        if (pageLoadingCount > 0) return
      }

      if (typeof delayTimerRef.current === 'number')
        clearTimeout(delayTimerRef.current)
      if (clearTransitionRef.current)
        clearTransitionRef.current(() => clearLoading(_targetDOM))
      else clearLoading(_targetDOM)
    }
  }, [loading])

  if (type === 'Page') {
    return {
      loading,
      setLoading,
    }
  }

  return {
    loading,
    setLoading,
    ref,
  }
}

const validPosition = {relative: 1, absolute: 1, fixed: 1, sticky: 1}
function checkTargetDOMPosition(targetDOM) {
  if (!targetDOM) return
  const targetDOMPosition = getComputedStyle(targetDOM).position
  if (validPosition[targetDOMPosition]) return
  targetDOM.dataset.position = targetDOMPosition
  targetDOM.style.position = 'relative'
}

function resetTargetDOMPosition(targetDOM) {
  if (!targetDOM || !targetDOM.dataset.position) return
  targetDOM.style.position = targetDOM.dataset.position
  delete targetDOM.dataset.position
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
