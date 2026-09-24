import useSWR from 'swr'
import {useRPCProvider} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../constants'

const {WALLET_VALIDATE_20TOKEN} = RPC_METHODS

export function useTokenMetadata({address, network}) {
  const {provider} = useRPCProvider()
  const {eid: networkId, name: networkName} = network ?? {}

  const {data} = useSWR(
    provider && address && networkName
      ? [WALLET_VALIDATE_20TOKEN, networkId, networkName, address]
      : null,
    async () => {
      try {
        const token = await provider.request({
          method: WALLET_VALIDATE_20TOKEN,
          networkName,
          params: {tokenAddress: address},
        })

        return token.valid ? {...token, address} : null
      } catch {
        return null
      }
    },
    {
      refreshInterval: 0,
    },
  )

  return data ?? null
}
