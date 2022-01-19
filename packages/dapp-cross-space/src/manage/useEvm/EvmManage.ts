import {observable, autorun} from '@formily/reactive'
import FluentManage from '../useFluent/FluentManage'
import {confluxNetworkConfig} from '../useConflux'
import {Unit} from '../../utils'

export interface Status {
  isInstalled: boolean
  isConnected?: boolean
  account?: string
  accounts?: string[]
  chainId?: ConfluxChainId
  evmMappedAddress?: string
}

class EvmManage {
  networkConfig = observable.computed(() =>
    FluentManage.status.chainId
      ? confluxNetworkConfig[FluentManage.status.chainId]
      : undefined,
  )
  isSupportEvmSpace = observable.ref(true)

  trackBalanceCount = observable.ref(1)
  balance = observable.ref<Unit | undefined>(undefined)
  balanceTimer?: number = undefined

  constructor() {
    this.trackBalance()
  }

  getBalance = async () => {
    if (!this.networkConfig.value) {
      this.isSupportEvmSpace.value = false
      this.balance.value = undefined
      return
    }
    if (!FluentManage.evmMappedAddress.value) {
      this.balance.value = undefined
      return
    }

    try {
      const balance = await fetch(this.networkConfig.value.url, {
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [FluentManage.evmMappedAddress.value, 'latest'],
          id: 1,
        }),
        headers: {'content-type': 'application/json'},
        method: 'POST',
      }).then(response => response.json())

      if (typeof balance?.result === 'string') {
        this.isSupportEvmSpace.value = true
        if (
          this.balance.value === undefined ||
            this.balance.value.drip !== Unit.fromHexDrip(balance.result).drip
        ) {
          this.balance.value = Unit.fromHexDrip(balance.result)
        }
      }

      if (balance?.error) {
        console.error('Track evmMappedAddress balance error: ', balance?.error)
        this.isSupportEvmSpace.value = false
        this.balance.value = undefined
      }
    } catch (err) {
      console.error('Track evmMappedAddress balance error: ', err)
      this.balance.value = undefined
      this.isSupportEvmSpace.value = false
    }
  }

  trackBalance = () => {
    autorun(() => {
      clearInterval(this.balanceTimer)
      if (!FluentManage.evmMappedAddress.value) this.balance.value = undefined
      if (!FluentManage.evmMappedAddress.value || !this.trackBalanceCount.value)
        return
      this.getBalance()
      clearInterval(this.balanceTimer)
      this.balanceTimer = (setInterval(
        this.getBalance,
        1000,
      ) as unknown) as number
    })
  }

  startTrackBalance = () => (this.trackBalanceCount.value += 1)

  stopTrackBalance = () =>
    (this.trackBalanceCount.value = Math.max(
      0,
      this.trackBalanceCount.value - 1,
    ))

  trackEvmMappedAddressBalanceChangeOnce = (callback: Function) => {
    let dispose: (() => void) | undefined = undefined
    dispose = autorun(() => {
      const watch = this.balance.value
      if (!dispose) return
      callback(this.balance.value)
      dispose()
    })
  }

  addEVMChain = async () => {
    if (!window.ethereum) return
    
    return window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x2ee1',
          chainName: 'EVM Conflux',
          nativeCurrency: {
            name: 'Conflux',
            symbol: 'CFX',
            decimals: 18,
          },
          rpcUrls: ['https://evmnet.confluxrpc.com'],
          blockExplorerUrls: ['https://confluxscan.io'],
        },
      ],
    })
  }
}

const Manage = new EvmManage()

export const startTrackBalance = Manage.startTrackBalance
export const stopTrackBalance = Manage.stopTrackBalance
export const trackEvmMappedAddressBalanceChangeOnce =
  Manage.trackEvmMappedAddressBalanceChangeOnce
export const addEVMChainToMetaMask = Manage.addEVMChain

export default Manage
