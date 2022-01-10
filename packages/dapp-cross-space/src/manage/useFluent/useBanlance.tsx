import React, {createContext, useState, useEffect, useContext} from 'react'
import {autorun} from '@formily/reactive'
import Manage, {startTrackBalance, stopTrackBalance} from './FluentManage'

const BalanceContext = createContext<string | undefined>(undefined)

const BalanceProvider: React.FC = ({children}) => {
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
    <BalanceContext.Provider value={balance}>
      {children}
    </BalanceContext.Provider>
  )
}

const useBalance = () => useContext(BalanceContext)

export {useBalance, BalanceProvider}
