import {useState, useEffect} from 'react'
const DURATION = 300

const useAnimation = errorMessage => {
  const [errorAnimateStyle, setErrorAnimateStyle] = useState('')
  const [displayErrorMsg, setDisplayErrorMsg] = useState('')

  useEffect(() => {
    let timer = null
    if (errorMessage) {
      timer && clearTimeout(timer)
      setDisplayErrorMsg(errorMessage)
      setErrorAnimateStyle('!scale-y-100 text-xs text-error pt-2')
    } else if (errorAnimateStyle) {
      setErrorAnimateStyle('scale-y-0 text-xs text-error pt-2')
      timer = setTimeout(() => {
        setErrorAnimateStyle('')
        setDisplayErrorMsg(errorMessage)
        clearTimeout(timer)
      }, DURATION)
    }
    return () => {
      timer && clearTimeout(timer)
    }
  }, [errorAnimateStyle, errorMessage])

  return {errorAnimateStyle, displayErrorMsg}
}

export default useAnimation
