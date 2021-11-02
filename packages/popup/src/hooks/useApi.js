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
  WALLET_GET_NETWORK,
  WALLET_IS_LOCKED,
  ACCOUNT_GROUP_TYPE,
  WALLET_DETECT_ADDRESS_TYPE,
  WALLETDB_HOME_PAGE_ASSETS,
  WALLETDB_REFETCH_BALANCE,
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

export const useNetwork = () => {
  const {data: networkData} = useRPC([WALLET_GET_NETWORK], undefined, {
    fallbackData: [{}],
  })
  return networkData
}

export const useCfxNetwork = () => {
  const {data: cfxNetWork} = useRPC(
    [WALLET_GET_NETWORK],
    {
      type: 'cfx',
    },
    {fallbackData: [{}]},
  )
  return cfxNetWork
}

export const useEthNetwork = () => {
  const {data: ethNetWork} = useRPC(
    [WALLET_GET_NETWORK],
    {
      type: 'eth',
    },
    {fallbackData: [{}]},
  )
  return ethNetWork
}

export const useNetworkByChainId = (chainId, type) => {
  const {data: network} = useRPC(
    chainId ? [WALLET_GET_NETWORK, chainId] : null,
    {
      chainId,
      type,
    },
    {fallbackData: [{}]},
  )
  return network
}

export const useHdAccountGroup = () => {
  const {data: hdGroup} = useRPC(
    [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD],
    {type: ACCOUNT_GROUP_TYPE.HD},
    {fallbackData: [{}]},
  )
  return hdGroup
}

export const usePkAccountGroup = () => {
  const {data: pkGroup} = useRPC(
    [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.PK],
    {type: ACCOUNT_GROUP_TYPE.PK},
    {fallbackData: [{}]},
  )
  return pkGroup
}

export const useAllGroup = () => {
  const {data: group} = useRPC([WALLET_GET_ACCOUNT_GROUP], undefined, {
    fallbackData: [{}],
  })
  return group
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
  const {data: pendingAuthReq} = useRPC(
    canSendReq ? [WALLET_GET_PENDING_AUTH_REQUEST] : null,
  )
  return pendingAuthReq
}

export const useAddressByNetworkId = (accountIds = [], networkId) => {
  if (isNumber(accountIds)) accountIds = [accountIds]
  const params = accountIds.map(accountId => ({
    accountId,
    networkId,
  }))
  const {data: address} = useRPC(
    params.length && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, ...accountIds]
      : null,
    params,
    {fallbackData: isNumber(accountIds) ? {} : [{}]},
  )
  return address
}

export const useBalance = (
  address,
  networkId,
  tokenContractAddress = '0x0',
) => {
  const {data: balance} = useRPC(
    address && isNumber(networkId) && isString(tokenContractAddress)
      ? [WALLET_GET_BALANCE, address, networkId]
      : null,
    {
      users: [address],
      tokens: [tokenContractAddress],
    },
    {fallbackData: {}},
  )
  return balance
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
  const {ticker: currentNativeToken} = useCurrentNetwork()
  return currentNativeToken
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

export const useDbHomeAssets = () => {
  const {data: homeAssets} = useRPC([WALLETDB_HOME_PAGE_ASSETS], undefined, {
    fallbackData: {},
  })
  useDbRefetchBalance()
  return homeAssets
}

export const useDbRefetchBalance = () => {
  useRPC([WALLETDB_REFETCH_BALANCE])
}
