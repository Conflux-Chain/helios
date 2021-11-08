import {useEffect, useState} from 'react'
import {useCurrentDapp} from '../../../hooks/useApi'

const getAuthorizedAccountIdIcon = (accounts, icon) => {
  const accountIcons = {}
  accounts.forEach(({eid}) => {
    accountIcons[eid] = icon
  })
  return accountIcons
}
const useAuthorizedAccountIdIcon = () => {
  const [authorizedAccountIdObj, setAuthorizedAccountIdObj] = useState({})
  const currentDapp = useCurrentDapp()
  useEffect(() => {
    if (currentDapp?.app?.account) {
      setAuthorizedAccountIdObj(
        getAuthorizedAccountIdIcon(
          currentDapp.app.account,
          currentDapp.site.icon,
        ),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(currentDapp)])
  return authorizedAccountIdObj
}

export default useAuthorizedAccountIdIcon
