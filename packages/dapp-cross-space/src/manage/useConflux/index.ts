import {format} from 'js-conflux-sdk'
import CrossSpaceContractConfig from 'js-conflux-sdk/src/contract/internal/CrossSpaceCall.json'

export const CrossSpaceContractAdress = format.address(
  CrossSpaceContractConfig.address,
  1030,
)

export {useConflux} from './useConflux'
export {useCrossSpaceContract} from './useCrossSpaceContract'
export {confluxNetworkConfig, type CrossSpaceContract} from './ConfluxManage'
