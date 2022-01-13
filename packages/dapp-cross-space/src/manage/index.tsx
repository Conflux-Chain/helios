import {FluentProvider} from './useFluent/useFluentStatus'
import {BalanceProvider} from './useFluent/useBanlance'
import {EvmMappedAddressBalanceProvider} from './useEvm'
import {ConfluxProvider} from './useConflux/useConflux'
import {CrossSpaceContractProvider} from './useConflux/useCrossSpaceContract'

const Provider: React.FC = ({children}) => {
  return (
    <FluentProvider>
      <ConfluxProvider>
        <CrossSpaceContractProvider>
          <BalanceProvider>
            <EvmMappedAddressBalanceProvider>
              {children}
            </EvmMappedAddressBalanceProvider>
          </BalanceProvider>
        </CrossSpaceContractProvider>
      </ConfluxProvider>
    </FluentProvider>
  )
}

export {Provider}
export {
  useFluent,
  useBalance,
  connect,
  sendTransaction,
  trackBalanceChangeOnce,
  addEVMChain,
} from './useFluent'
export {
  useConflux,
  useCrossSpaceContract,
  confluxNetworkConfig,
} from './useConflux'
export {
  useEvmMappedAddressBalance,
  trackEvmMappedAddressBalanceChangeOnce,
  useIsSupportEvmSpace,
  addEVMChainToMetaMask
} from './useEvm'
