import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../../constants'
import {useEffect, useState} from 'react'
const {WALLET_GET_CURRENT_DAPP} = RPC_METHODS

const getAuthorizedAccountIdIcon = (accounts, icon) => {
  const accountIcons = {}
  accounts.forEach(({eid}) => {
    accountIcons[eid] = icon
  })
  return accountIcons
}
const useAuthorizedAccountIdIcon = () => {
  const [authorizedAccountIdObj, setAuthorizedAccountIdObj] = useState({})
  const {data: currentDapp} = useRPC([WALLET_GET_CURRENT_DAPP])
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
