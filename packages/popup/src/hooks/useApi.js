import {RPC_METHODS, NETWORK_TYPE} from '../constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber, isString} from '@fluent-wallet/checks'
import {validateAddress} from '../utils'

const {
  QUERY_BALANCE,
  QUERY_ADDRESS,
  QUERY_TOKEN,
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
  WALLET_GET_CURRENT_DAPP,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_ZERO_ACCOUNT_GROUP,
  WALLET_GET_NETWORK,
  WALLET_IS_LOCKED,
  ACCOUNT_GROUP_TYPE,
  WALLET_DETECT_ADDRESS_TYPE,
  WALLETDB_HOME_PAGE_ASSETS,
  WALLETDB_REFETCH_BALANCE,
  WALLETDB_ADD_TOKEN_LIST,
  WALLETDB_ACCOUNT_LIST_ASSETS,
  WALLET_VALIDATE_20TOKEN,
  WALLETDB_TXLIST,
  WALLET_GET_BLOCKCHAIN_EXPLORER_URL,
} = RPC_METHODS

export const useCurrentAddress = () => {
  const {data, mutate} = useRPC(
    [QUERY_ADDRESS, 'useCurrnetwork'],
    {
      selected: true,
      g: {
        value: 1,
        hex: 1,
        eid: 1,
        nativeBalance: 1,
        _account: {nickname: 1, eid: 1},
        network: {
          eid: 1,
          ticker: 1,
          netId: 1,
          chainId: 1,
          name: 1,
          icon: 1,
          scanUrl: 1,
          type: 1,
        },
      },
    },
    {fallbackData: {}},
  )
  return {data, mutate}
}

export const useTokenBalanceOfCurrentAddress = tokenId => {
  const {data} = useCurrentAddress()
  return useRPC(
    data ? [QUERY_BALANCE, 'useTokenBalanceOfCurrentAddress', tokenId] : null,
    {
      tokenId,
      addressId: data,
      g: {
        value: 1,
      },
    },
  ).data?.[0]?.value
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
    fallbackData: [],
  })
  return networkData
}

export const useCfxNetwork = () => {
  const {data: cfxNetWork} = useRPC(
    [WALLET_GET_NETWORK, 'cfx'],
    {
      type: 'cfx',
    },
    {fallbackData: []},
  )
  return cfxNetWork
}

export const useEthNetwork = () => {
  const {data: ethNetWork} = useRPC(
    [WALLET_GET_NETWORK, 'eth'],
    {
      type: 'eth',
    },
    {fallbackData: []},
  )
  return ethNetWork
}

export const useNetworkByChainId = (chainId, type) => {
  const {data: network} = useRPC(
    chainId ? [WALLET_GET_NETWORK, type, chainId] : null,
    {
      chainId,
      type,
    },
    {fallbackData: []},
  )
  return network
}

export const useHdAccountGroup = () => {
  const zeroGroup = useIsZeroGroup()
  const {data: hdGroup} = useRPC(
    zeroGroup === false
      ? [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD]
      : null,
    {type: ACCOUNT_GROUP_TYPE.HD},
    {fallbackData: []},
  )
  return hdGroup
}

export const usePkAccountGroup = () => {
  const zeroGroup = useIsZeroGroup()
  const {data: pkGroup} = useRPC(
    zeroGroup === false
      ? [WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.PK]
      : null,
    {type: ACCOUNT_GROUP_TYPE.PK},
    {fallbackData: []},
  )
  return pkGroup
}

export const useAllGroup = () => {
  const zeroGroup = useIsZeroGroup()
  const {data: group} = useRPC(
    zeroGroup === false ? [WALLET_GET_ACCOUNT_GROUP] : null,
    undefined,
    {
      fallbackData: [],
    },
  )
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
  const {data: accountAddress} = useRPC(
    params.length && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId, ...accountIds]
      : null,
    params,
    {fallbackData: isNumber(accountIds) ? {} : []},
  )
  return accountAddress || {}
}

export const useBalance = (
  address,
  networkId,
  tokenContractAddress = '0x0',
) => {
  const {data: balance} = useRPC(
    address && isNumber(networkId) && isString(tokenContractAddress)
      ? [WALLET_GET_BALANCE, address, networkId, tokenContractAddress]
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
  return useCurrentAddress().data?.network?.type === NETWORK_TYPE.CFX
}

export const useAddressType = address => {
  const netId = useCurrentAddress().data?.network?.netId
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const isValidAddress = validateAddress(address, networkTypeIsCfx, netId)
  const {
    data: {type},
  } = useRPC(
    isValidAddress ? [WALLET_DETECT_ADDRESS_TYPE, address] : null,
    {address},
    {fallbackData: {}},
  )
  return type
}

export const useToken = (...args) => {
  const [a1, a2] = args
  const params = a2 || a1
  const swrk = (a2 && a1) || JSON.stringify(params)
  const {data} = useRPC(swrk ? [QUERY_TOKEN, swrk] : null, params)
  return data
}

export const useCurrentAddressTokens = () => {}

export const useDbHomeAssets = () => {
  const {data: curAddr} = useCurrentAddress()
  const accountId = curAddr.account?.eid
  const networkId = curAddr.network?.eid

  const {data: homeAssets} = useRPC(
    [WALLETDB_HOME_PAGE_ASSETS, accountId, networkId],
    undefined,
    {
      fallbackData: {},
    },
  )
  useDbRefetchBalance({type: 'all'})
  return homeAssets
}

export const useDbRefetchBalance = param => {
  useRPC([WALLETDB_REFETCH_BALANCE], param ? {...param} : undefined)
}

export const useDbAddTokenList = () => {
  const {data: addTokenListData} = useRPC([WALLETDB_ADD_TOKEN_LIST, 'all'], {
    type: 'all',
  })
  useDbRefetchBalance()
  return addTokenListData
}

export const useDbAccountListAssets = () => {
  const {data: accountListAssets} = useRPC(
    [WALLETDB_ACCOUNT_LIST_ASSETS, 'all'],
    {
      type: 'all',
      accountGroupTypes: [
        ACCOUNT_GROUP_TYPE.HD,
        ACCOUNT_GROUP_TYPE.PK,
        ACCOUNT_GROUP_TYPE.HW,
      ],
    },
    {
      fallbackData: {},
    },
  )
  useDbRefetchBalance()
  return accountListAssets
}

export const useValid20Token = address => {
  const {data: token} = useRPC(
    address ? [WALLET_VALIDATE_20TOKEN, address] : null,
    {tokenAddress: address},
    {
      fallbackData: {},
    },
  )
  return token
}

export const useTxList = params => {
  const {data: curAddr} = useCurrentAddress()
  const addressId = curAddr.eid
  const {data: listData} = useRPC(
    addressId ? [WALLETDB_TXLIST, ...Object.values(params), addressId] : null,
    {...params, addressId},
    {
      fallbackData: params?.countOnly ? 0 : {},
    },
  )
  return listData
}

export const useBlockchainExplorerUrl = params => {
  const {data: urlData} = useRPC([WALLET_GET_BLOCKCHAIN_EXPLORER_URL], {
    ...params,
  })
  return urlData
}
