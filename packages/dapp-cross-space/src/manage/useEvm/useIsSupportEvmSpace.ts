import {useState, useEffect} from 'react'
import {autorun} from '@formily/reactive'
import Manage from './EvmManage'

export const useIsSupportEvmSpace = () => {
  const [isSupportEvmSpace, setIsSupportEvmSpace] = useState(false)
  useEffect(() => {
    const dispose = autorun(() => {
      setIsSupportEvmSpace(Manage.isSupportEvmSpace.value)
    })

    return dispose
  }, [])

  return isSupportEvmSpace
}
