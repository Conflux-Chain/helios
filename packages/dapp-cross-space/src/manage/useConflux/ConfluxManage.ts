import {observable} from '@formily/reactive'
import CrossSpaceContractConfig from 'js-conflux-sdk/src/contract/internal/CrossSpaceCall.json'
import {Conflux, format} from 'js-conflux-sdk'
import FluentManage from '../useFluent/FluentManage'

export interface CrossSpaceContract {
  transferEVM(evmAddress: string): Record<string, string>
  withdrawFromMapped(evmAddress: string): any
}

export const confluxNetworkConfig = {
  '12000': {
    networkId: 12000,
    url: 'https://net12000cfx.confluxrpc.com',
    evmSpaceUrl: 'https://net12001eth.confluxrpc.com'
  },
  '1029': {
    networkId: 1029,
    url: 'https://main.confluxrpc.com',
    evmSpaceUrl: 'https://main.confluxrpc.com'
  },
  '1': {
    networkId: 1,
    url: 'https://test.confluxrpc.com',
    evmSpaceUrl: 'https://test.confluxrpc.com'
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
