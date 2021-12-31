import {useState, useEffect} from 'react'
const DURATION = 500

const useAnimation = open => {
  const [wrapperAnimateStyle, setWrapperAnimateStyle] = useState('')
  const [contentAnimateStyle, setContentAnimateStyle] = useState('')

  useEffect(() => {
    let timer = null
    if (open) {
      setWrapperAnimateStyle('!bg-opacity-60')
      setContentAnimateStyle('show-modal-content')
    } else if (wrapperAnimateStyle) {
      setWrapperAnimateStyle('bg-opacity-0')
      setContentAnimateStyle('hide-modal-content scale-0')
      timer = setTimeout(() => {
        setWrapperAnimateStyle('')
        setContentAnimateStyle('')
        clearTimeout(timer)
      }, DURATION)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [open, wrapperAnimateStyle])

  return {wrapperAnimateStyle, contentAnimateStyle}
}

export default useAnimation
