import {useCurrentAddress} from '../../hooks/useApi'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isUndefined} from '@fluent-wallet/checks'
import {RPC_METHODS, NETWORK_TYPE} from '../../constants'

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
  if (!isUndefined(hmInfoData)) {
    let addToGroupData = null
    if (hmInfoData.length) {
      for (let i = 0; i < hmInfoData.length; i++) {
        if (
          hmInfoData[i].vault.device === device &&
          ((netType === NETWORK_TYPE.CFX && hmInfoData[i].vault?.cfxOnly) ||
            (netType === NETWORK_TYPE.ETH && !hmInfoData[i].vault?.cfxOnly))
        ) {
          addToGroupData = hmInfoData[i]
          break
        }
      }
    }

    if (!addToGroupData) {
      params.accountGroupNickname = `${device}-${
        netType === NETWORK_TYPE.CFX ? 'CFX' : 'EVM'
      }`
      params.device = device
      params.type = netType
    } else {
      params.accountGroupId = addToGroupData.eid
      params.accountGroupData = {...addToGroupData.vault.ddata}
      nextAccountIndex = addToGroupData.account.length + 1
    }
  }
  return {params, nextAccountIndex}
}

export default useImportHWParams
