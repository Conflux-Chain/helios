import {useEffect} from 'react'
import useGlobalStore from '../stores'
import {useHistory} from 'react-router-dom'

export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()

  useEffect(() => {
    if (!createdPassword) {
      history.push('/')
    }
  }, [createdPassword, history])
}

export const useFontSize = (id, maxWidth, value) => {
  console.log('maxWidth', maxWidth)
  useEffect(() => {
    const targetDom = document.getElementById(id)
    const contentWidth = targetDom.offsetWidth
    console.log('contentWidth:', contentWidth)
    if (contentWidth > maxWidth) {
      const fontSize = (maxWidth / contentWidth) * 14
      console.log('fontSize:', fontSize)
      targetDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    }
  }, [id, maxWidth, value])
}
