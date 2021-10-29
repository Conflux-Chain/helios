import {RPC_METHODS, NETWORK_TYPE} from '../constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber, isString} from '@fluent-wallet/checks'
import {request} from '../utils'

const {
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
  WALLET_GET_CURRENT_NETWORK,
  WALLET_GET_CURRENT_ACCOUNT,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_ZERO_ACCOUNT_GROUP,
  WALLET_IS_LOCKED,
  ACCOUNT_GROUP_TYPE,
  WALLET_DETECT_ADDRESS_TYPE,
  WALLET_VALIDATE_20TOKEN,
} = RPC_METHODS

export const useCurrentAccount = () => {
  const currentNetwork = useCurrentNetwork()
  const {eid: networkId, type: networkType} = currentNetwork
  const {data: currentAccount} = useRPC(
    [WALLET_GET_CURRENT_ACCOUNT],
    undefined,
    {
      fallbackData: {},
    },
  )
  const {eid: accountId} = currentAccount || {}
  const {data: accountAddress} = useAddressByNetworkId(accountId, networkId)
  const {base32, hex} = accountAddress
  const address =
    networkType === NETWORK_TYPE.CFX
      ? base32
      : networkType === NETWORK_TYPE.ETH
      ? hex
      : ''
  return {
    ...currentAccount,
    address,
  }
}

export const useCurrentNetwork = () => {
  const {data: currentNetwork} = useRPC(
    [WALLET_GET_CURRENT_NETWORK],
    undefined,
    {
      fallbackData: {},
    },
  )
  return currentNetwork
}

export const useAccountGroup = () => {
  const {data: accountGroup} = useRPC([WALLET_GET_ACCOUNT_GROUP])
  return accountGroup
}

export const useHdAccountGroup = () => {
  const {data: hdGroup} = useRPC(
    [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD],
    {type: ACCOUNT_GROUP_TYPE.HD},
    {fallbackData: []},
  )
  return hdGroup
}

export const useIsLocked = () => {
  const {data: lockedData} = useRPC([WALLET_IS_LOCKED])
  return lockedData
}

export const useIsZeroGroup = () => {
  const {data: zeroGroup} = useRPC([WALLET_ZERO_ACCOUNT_GROUP])
  return zeroGroup
}

export const usePendingAuthReq = (canSendReq = true) => {
  const {data: pendingAuthReq, error: pendingReqError} = useRPC(
    canSendReq ? [WALLET_GET_PENDING_AUTH_REQUEST] : null,
  )
  return {pendingAuthReq, pendingReqError}
}

export const useAddressByNetworkId = (accountIds = [], networkId) => {
  if (!Array.isArray(accountIds)) accountIds = [accountIds]
  const params = accountIds.map(accountId => {
    accountId, networkId
  })
  const {data} = useRPC(
    params.length && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, ...accountIds]
      : null,
    params,
    {fallbackData: []},
  )
  return data
}

export const useBalance = (
  accountId,
  networkId,
  tokenContractAddress = '0x0',
) => {
  const {
    data: {base32, hex},
  } = useAddressByNetworkId(accountId, networkId)
  const address = base32 || hex
  const {data, error} = useRPC(
    address && isNumber(networkId) && isString(tokenContractAddress)
      ? [WALLET_GET_BALANCE, address, networkId]
      : null,
    {
      users: [address],
      tokens: [tokenContractAddress],
    },
    {fallbackData: {}},
  )
  return {data, error}
}

export const useIsCfx = () => {
  const currentNetwork = useCurrentNetwork()
  return currentNetwork?.type === 'cfx'
}

export const useIsEth = () => {
  const currentNetwork = useCurrentNetwork()
  return currentNetwork?.type === 'eth'
}

export const useCurrentNativeToken = () => {
  const {ticker} = useCurrentNetwork()
  return ticker
}

export const useAddressType = address => {
  const {
    data: {type},
  } = useRPC(
    address ? [WALLET_DETECT_ADDRESS_TYPE] : null,
    {address},
    {fallbackData: {}},
  )
  return type
}

export const get20Token = value => {
  request(WALLET_VALIDATE_20TOKEN, {
    tokenAddress: value,
  }).then(({result}) => {
    return result
  })
}
