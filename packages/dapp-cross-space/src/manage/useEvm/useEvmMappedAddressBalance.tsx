import React, {createContext, useState, useEffect, useContext} from 'react'
import {autorun} from '@formily/reactive'
import Manage, {startTrackBalance, stopTrackBalance} from './EvmManage'

const EvmMappedAddressBalanceContext = createContext<string | undefined>(
  undefined,
)

const EvmMappedAddressBalanceProvider: React.FC = ({children}) => {
  const [balance, setBalance] = useState<string | undefined>(undefined)
  useEffect(() => {
    startTrackBalance()
    const dispose = autorun(() => {
      setBalance(Manage.balance.value)
    })

    return () => {
      stopTrackBalance()
      dispose()
    }
  }, [])

  return (
    <EvmMappedAddressBalanceContext.Provider value={balance}>
      {children}
    </EvmMappedAddressBalanceContext.Provider>
  )
}

const useEvmMappedAddressBalance = () =>
  useContext(EvmMappedAddressBalanceContext)

export {useEvmMappedAddressBalance, EvmMappedAddressBalanceProvider}
