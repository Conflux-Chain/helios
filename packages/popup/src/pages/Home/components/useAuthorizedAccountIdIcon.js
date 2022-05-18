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
  const {data: currentDappData} = useCurrentDapp()

  useEffect(() => {
    if (currentDappData?.app?.account) {
      setAuthorizedAccountIdObj(
        getAuthorizedAccountIdIcon(
          currentDappData.app.account,
          currentDappData.site.icon,
        ),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDappData?.app?.account])
  return authorizedAccountIdObj
}

export default useAuthorizedAccountIdIcon
