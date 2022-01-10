import {observable} from '@formily/reactive'
import CrossSpaceContractConfig from 'js-conflux-sdk/src/contract/internal/CrossSpaceCall.json'
import {Conflux} from 'js-conflux-sdk'
import FluentManage from '../useFluent/FluentManage'

interface CrossSpaceContract {
  transferEVM(evmAddress: string): Record<string, string>
  withdrawFromMapped(evmAddress: string): any
}

export const confluxNetworkConfig = {
  '1030': {
    networkId: 1030,
    url: 'http://47.104.89.179:12537',
  },
  '1029': {
    networkId: 1029,
    url: 'https://main.confluxrpc.com',
  },
  '1': {
    networkId: 1,
    url: 'https://test.confluxrpc.com',
  },
} as const

class ConfluxManage {
  conflux = observable.computed(() =>
    FluentManage.status.chainId
      ? new Conflux(confluxNetworkConfig[FluentManage.status.chainId])
      : undefined,
  )
  CrossSpaceContract = observable.computed(
    () =>
      (this.conflux.value?.Contract(
        CrossSpaceContractConfig,
      ) as unknown) as CrossSpaceContract,
  )
}

const Manage = new ConfluxManage()
export default Manage
