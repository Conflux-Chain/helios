import React, {createContext, useState, useEffect, useContext} from 'react'
import {autorun} from '@formily/reactive'
import ConfluxManage from './ConfluxManage'

const CrossSpaceContractContext = createContext<
  typeof ConfluxManage.crossSpaceContract.value
>(null!)

const CrossSpaceContractProvider: React.FC = ({children}) => {
  const [crossSpaceContract, setCrossSpaceContract] = useState(
    () => ConfluxManage.crossSpaceContract.value,
  )
  useEffect(() => {
    return autorun(() => {
      setCrossSpaceContract(ConfluxManage.crossSpaceContract.value)
    })
  }, [])

  return (
    <CrossSpaceContractContext.Provider value={crossSpaceContract}>
      {children}
    </CrossSpaceContractContext.Provider>
  )
}

const useCrossSpaceContract = () => useContext(CrossSpaceContractContext)

export {useCrossSpaceContract, CrossSpaceContractProvider}
