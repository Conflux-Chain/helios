import React, {createContext, useState, useEffect, useContext} from 'react'
import {autorun} from '@formily/reactive'
import Manage, {startTrackBalance, stopTrackBalance} from './FluentManage'
import {type Unit} from '../../utils'

const BalanceContext = createContext<{ balance?: Unit, maxAvailableBalance?: Unit }>({ balance: undefined, maxAvailableBalance: undefined })

const BalanceProvider: React.FC = ({children}) => {
  const [balance, setBalance] = useState<Unit | undefined>(undefined)
  const [maxAvailableBalance, setMaxAvailableBalance] = useState<Unit | undefined>(undefined)

  useEffect(() => {
    startTrackBalance()
    const dispose = autorun(() => {
      setBalance(Manage.balance.value)
      setMaxAvailableBalance(Manage.maxAvailableBalance.value)
    })

    return () => {
      stopTrackBalance()
      dispose()
    }
  }, [])

  return (
    <BalanceContext.Provider value={{ balance, maxAvailableBalance }}>
      {children}
    </BalanceContext.Provider>
  )
}

const useBalance = () => useContext(BalanceContext)

export {useBalance, BalanceProvider}
