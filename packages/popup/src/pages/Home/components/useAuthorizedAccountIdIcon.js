import {useEffect, useState} from 'react'
import {useCurrentDapp} from '../../../hooks/useApi'
import {useDappIcon} from '../../../hooks'

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

  const dappIconUrl = useDappIcon(currentDappData?.site?.icon)

  useEffect(() => {
    if (currentDappData?.app?.account) {
      setAuthorizedAccountIdObj(
        getAuthorizedAccountIdIcon(currentDappData.app.account, dappIconUrl),
      )
    }
  }, [currentDappData?.app?.account, dappIconUrl])
  return authorizedAccountIdObj
}

export default useAuthorizedAccountIdIcon
