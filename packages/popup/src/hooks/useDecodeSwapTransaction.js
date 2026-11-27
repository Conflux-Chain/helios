import {useMemo} from 'react'
import {decodeSwapTransaction} from '../utils/decodeSwapTransaction'

export function useDecodeSwapTransaction(tx, network) {
  const {from, to, data, input, value, chainId} = tx ?? {}
  const {type, chainId: networkChainId} = network ?? {}
  return useMemo(
    () =>
      decodeSwapTransaction(
        {from, to, data, input, value, chainId},
        {type, chainId: networkChainId},
      ),
    [from, to, data, input, value, chainId, type, networkChainId],
  )
}
