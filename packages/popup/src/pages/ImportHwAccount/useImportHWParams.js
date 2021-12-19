import {useCurrentAddress} from '../../hooks/useApi'
import {useRPC} from '@fluent-wallet/use-rpc'
import {RPC_METHODS} from '../../constants'

const {WALLET_GET_IMPORT_HARDWARE_WALLET_INFO} = RPC_METHODS

const useImportHWParams = device => {
  const {
    data: {
      network: {eid: networkId, type: netType},
    },
  } = useCurrentAddress()
  let params = {}
  const {data: hmInfoData} = useRPC(
    device && networkId
      ? [WALLET_GET_IMPORT_HARDWARE_WALLET_INFO, 'useImportHW', device]
      : null,
    {
      devices: [device],
    },
  )
  let nextAccountIndex = 1
  if (hmInfoData) {
    if (!hmInfoData?.group) {
      params.accountGroupNickname = device
      params.device = device
      params.type = netType
    } else {
      params.accountGroupId = hmInfoData.group.eid
      params.accountGroupData = {...hmInfoData.group.vault.ddata}
      nextAccountIndex = hmInfoData.group.account.length + 1
    }
  }
  return {params, nextAccountIndex}
}

export default useImportHWParams
