import {useEffect} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'

export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()

  useEffect(() => {
    if (!createdPassword) {
      history.push('/')
    }
  }, [createdPassword, history])
}

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}
