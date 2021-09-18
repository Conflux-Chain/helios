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

export const useFontSize = (id, maxWidth) => {
  useEffect(() => {
    const balanceDom = document.getElementById(id)
    const contentWidth = balanceDom.offsetWidth
    if (contentWidth > maxWidth) {
      const fontSize = (maxWidth / contentWidth) * 14
      balanceDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    }
  }, [id, maxWidth])
}
