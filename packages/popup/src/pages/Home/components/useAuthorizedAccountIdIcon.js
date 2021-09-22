import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'
import {useEffect, useState} from 'react'
const {GET_CURRENT_DAPP} = RPC_METHODS

const getAuthorizedAccountIdIcon = (accounts, icon) => {
  const accountIcons = {}
  accounts.forEach(({eid}) => {
    accountIcons[eid] = icon
  })
  return accountIcons
}
const useAuthorizedAccountIdIcon = () => {
  const [authorizedAccountIdObj, setAuthorizedAccountId] = useState({})
  const {data: currentDapp} = useRPC([GET_CURRENT_DAPP], undefined, {
    fallbackData: {},
  })
  useEffect(() => {
    if (currentDapp?.app?.account) {
      setAuthorizedAccountId(
        getAuthorizedAccountIdIcon(
          currentDapp.app.account,
          currentDapp.site.icon,
        ),
      )
    }
  }, [currentDapp])
  return authorizedAccountIdObj
}

export default useAuthorizedAccountIdIcon
