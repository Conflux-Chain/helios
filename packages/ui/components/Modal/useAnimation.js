import {useState, useEffect} from 'react'
const DURATION = 500

const useAnimation = open => {
  const [wrapperAnimateStyle, setWrapperAnimateStyle] = useState('')
  const [contentAnimateStyle, setContentAnimateStyle] = useState('')
  const [animationTimer, setAnimationTimer] = useState(null)

  useEffect(() => {
    if (open) {
      setWrapperAnimateStyle('!bg-opacity-60')
      setContentAnimateStyle('show-modal-content')
    }

    if (wrapperAnimateStyle && !open) {
      setWrapperAnimateStyle('bg-opacity-0')
      setContentAnimateStyle('hide-modal-content scale-0')
      const timer = setTimeout(() => {
        setWrapperAnimateStyle('')
        setContentAnimateStyle('')
        clearTimeout(timer)
        setAnimationTimer(null)
      }, DURATION)
      setAnimationTimer(timer)
    }
  }, [open, wrapperAnimateStyle])

  useEffect(() => {
    return () => {
      animationTimer && clearTimeout(animationTimer)
    }
  }, [animationTimer])

  return {wrapperAnimateStyle, contentAnimateStyle}
}

export default useAnimation
