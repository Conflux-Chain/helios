import {RPC_METHODS, NETWORK_TYPE} from '../constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber, isString} from '@fluent-wallet/checks'

const {
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
  WALLET_GET_CURRENT_NETWORK,
  WALLET_GET_CURRENT_ACCOUNT,
  WALLET_GET_CURRENT_DAPP,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_ZERO_ACCOUNT_GROUP,
  WALLET_IS_LOCKED,
  ACCOUNT_GROUP_TYPE,
  WALLET_DETECT_ADDRESS_TYPE,
} = RPC_METHODS

export const useCurrentAccount = () => {
  const currentNetwork = useCurrentNetwork()
  const {eid: networkId} = currentNetwork
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const networkTypeIsEth = useNetworkTypeIsEth()
  const {data: currentAccount} = useRPC(
    [WALLET_GET_CURRENT_ACCOUNT],
    undefined,
    {
      fallbackData: {},
    },
  )
  const {eid: accountId} = currentAccount || {}
  const {data: accountAddress} = useAddressByNetworkId(accountId, networkId)
  const {base32, hex} = accountAddress || {}
  const address = networkTypeIsCfx ? base32 : networkTypeIsEth ? hex : ''
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

export const useCurrentDapp = () => {
  const {data: currentDapp} = useRPC([WALLET_GET_CURRENT_DAPP], undefined, {
    fallbackData: {},
  })

  return currentDapp
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
  const {data} = useRPC(canSendReq ? [WALLET_GET_PENDING_AUTH_REQUEST] : null)
  return data
}

export const useAddressByNetworkId = (accountIds = [], networkId) => {
  if (isNumber(accountIds)) accountIds = [accountIds]
  const params = accountIds.map(accountId => {
    accountId, networkId
  })
  const {data} = useRPC(
    params.length && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, ...accountIds]
      : null,
    params,
    {fallbackData: isNumber(accountIds) ? {} : []},
  )
  return data
}

export const useBalance = (
  address,
  networkId,
  tokenContractAddress = '0x0',
) => {
  const {data} = useRPC(
    address && isNumber(networkId) && isString(tokenContractAddress)
      ? [WALLET_GET_BALANCE, address, networkId]
      : null,
    {
      users: [address],
      tokens: [tokenContractAddress],
    },
    {fallbackData: {}},
  )
  return data
}

export const useNetworkTypeIsCfx = () => {
  const currentNetwork = useCurrentNetwork()
  return currentNetwork?.type === NETWORK_TYPE.CFX
}

export const useNetworkTypeIsEth = () => {
  const currentNetwork = useCurrentNetwork()
  return currentNetwork?.type === NETWORK_TYPE.ETH
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
