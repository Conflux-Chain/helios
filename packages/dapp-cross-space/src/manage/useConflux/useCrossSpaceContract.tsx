import React, {createContext, useState, useEffect, useContext} from 'react'
import {autorun} from '@formily/reactive'
import ConfluxManage from './ConfluxManage'

const CrossSpaceContractContext = createContext<{
  crossSpaceContract?: typeof ConfluxManage.crossSpaceContract.value;
  CrossSpaceContractAdress?: string;
}
>({}!)

const CrossSpaceContractProvider: React.FC = ({children}) => {
  const [crossSpaceContract, setCrossSpaceContract] = useState(
    () => ({
      crossSpaceContract: ConfluxManage.crossSpaceContract.value,
      CrossSpaceContractAdress: ConfluxManage.CrossSpaceContractAddress.value
    })
  )
  useEffect(() => {
    return autorun(() => {
      setCrossSpaceContract({
        crossSpaceContract: ConfluxManage.crossSpaceContract.value,
        CrossSpaceContractAdress: ConfluxManage.CrossSpaceContractAddress.value
      })
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
