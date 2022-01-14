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
      setErrorAnimateStyle('slide-in-up text-xs text-error')
    } else if (errorAnimateStyle) {
      setErrorAnimateStyle('text-xs text-error')
      timer = setTimeout(() => {
        setErrorAnimateStyle('')
        setDisplayErrorMsg(errorMessage)
      }, DURATION)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [errorAnimateStyle, errorMessage])

  return {errorAnimateStyle, displayErrorMsg}
}

export default useAnimation
