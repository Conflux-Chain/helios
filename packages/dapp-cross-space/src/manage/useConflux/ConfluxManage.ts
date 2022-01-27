import {observable} from '@formily/reactive'
import CrossSpaceContractConfig from 'js-conflux-sdk/src/contract/internal/CrossSpaceCall.json'
import {Conflux, format} from 'js-conflux-sdk'
import FluentManage from '../useFluent/FluentManage'

export interface CrossSpaceContract {
  transferEVM(evmAddress: string): Record<string, string>
  withdrawFromMapped(evmAddress: string): any
}

export const confluxNetworkConfig = {
  '1029': {
    networkId: 1029,
    url: 'https://main.confluxrpc.com',
    EvmSpace: {
      url: 'https://evm.confluxrpc.com',
      networkId: 1030,
      scan: 'https://evm.confluxscan.net'
    }
  },
  '1': {
    networkId: 1,
    url: 'https://test.confluxrpc.com',
    EvmSpace: {
      url: 'https://evmtest.confluxrpc.com',
      networkId: 71,
      scan: 'https://evmtestnet.confluxscan.net'
    }
  },
} as const

class ConfluxManage {
  conflux = observable.computed(() =>
    FluentManage.status.chainId
      ? new Conflux(confluxNetworkConfig[FluentManage.status.chainId])
      : undefined,
  )

  crossSpaceContract = observable.computed(
    () =>
      (this.conflux.value?.Contract(
        CrossSpaceContractConfig,
      ) as unknown) as CrossSpaceContract,
  )

  CrossSpaceContractAddress = observable.computed(
    () =>
    FluentManage.status.chainId
      ? format.address(
          CrossSpaceContractConfig.address,
          +FluentManage.status.chainId,
        ) as string
      : undefined
  )
}

const Manage = new ConfluxManage()
export default Manage
