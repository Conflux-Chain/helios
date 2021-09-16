import {useEffect} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES} from '../constants'

const {HOME} = ROUTES
export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()

  useEffect(() => {
    if (!createdPassword) {
      history.push(HOME)
    }
  }, [createdPassword, history])
}

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}
