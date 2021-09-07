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
