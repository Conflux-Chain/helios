import {isNumber, isString} from '@fluent-wallet/checks'
import {useRPC} from '@fluent-wallet/use-rpc'

import {NETWORK_TYPE, RPC_METHODS} from '../constants'
import {validateAddress} from '../utils'

const {
  QUERY_GROUP,
  QUERY_BALANCE,
  QUERY_ADDRESS,
  QUERY_ACCOUNT,
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
  WALLETDB_REFETCH_BALANCE,
  WALLETDB_ACCOUNT_LIST_ASSETS,
  WALLET_VALIDATE_20TOKEN,
  WALLETDB_TXLIST,
  WALLET_GET_BLOCKCHAIN_EXPLORER_URL,
} = RPC_METHODS

export const useCurrentAddress = () => {
  const {data, mutate} = useRPC(
    [QUERY_ADDRESS, 'useCurrentAddress'],
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
    {fallbackData: {network: {ticker: {}}, account: {}}},
  )
  return {data, mutate}
}

export const useCurrentDapp = () => {
  const {
    data: {eid: addressId},
  } = useCurrentAddress()
  const {data: currentDapp} = useRPC(
    [WALLET_GET_CURRENT_DAPP, addressId],
    undefined,
    {
      fallbackData: {},
    },
  )

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
  const netId = useCurrentAddress().data.network.netId
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

export const useDbRefetchBalance = param => {
  useRPC([WALLETDB_REFETCH_BALANCE], param ? {...param} : undefined)
  useRPC(
    [WALLETDB_REFETCH_BALANCE, 'REFETCH_ALL'],
    {type: 'all', allNetwork: true},
    {refreshInterval: 180000},
  )
}

export const useCurrentNetworkTokens = ({fuzzy, addressId}) => {
  useDbRefetchBalance({type: 'all'})
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()

  return useRPC(
    networkId
      ? [
          QUERY_TOKEN,
          'useCurrentNetworkTokens',
          networkId,
          addressId,
          fuzzy || '',
        ]
      : null,
    {fuzzy, addressId, networkId},
    {fallbackData: []},
  )
}
export const useCurrentAddressTokens = () => {
  const {
    data: {eid: addressId},
  } = useCurrentAddress()
  useDbRefetchBalance()
  return useRPC(
    addressId ? [QUERY_ADDRESS, 'useCurrentAddressTokens', addressId] : null,
    {
      addressId,
      g: {token: 1},
    },
    {
      fallbackData: [],
      postprocessSuccessData: d => (d?.token || []).map(t => t.eid),
    },
  )
}
export const useSingleTokenInfoWithNativeTokenSupport = tokenId => {
  if (tokenId === 'native' || tokenId === '0x0') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {ticker} = useCurrentAddress().data.network
    ticker.logoURI = ticker.iconUrls?.[0]
    ticker.decimals = 18
    return ticker
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRPC(
    tokenId ? [QUERY_TOKEN, 'useSingleTokenInfo', tokenId] : null,
    {
      tokenId,
      g: {name: 1, address: 1, symbol: 1, decimals: 1, logoURI: 1},
    },
    {fallbackData: {}},
  ).data
}

export const useSingleAddressTokenBalanceWithNativeTokenSupport = ({
  addressId,
  tokenId,
}) => {
  if (!addressId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    addressId = useCurrentAddress().data.eid
  }
  if (tokenId === '0x0' || tokenId === 'native') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRPC(
      addressId
        ? [QUERY_ADDRESS, 'useAddressTokenBalanceSupportNativeToken', addressId]
        : null,
      {addressId, g: {nativeBalance: 1}},
      {
        fallbackData: '0x0',
        postprocessSuccessData: d => d?.nativeBalance || '0x0',
      },
    ).data
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRPC(
    addressId && tokenId
      ? [QUERY_BALANCE, 'useAddressTokenBalance', addressId, tokenId]
      : null,
    {addressId, tokenId, g: {value: 1}},
    {fallbackData: '0x0', postprocessSuccessData: d => d?.[0]?.value || '0x0'},
  ).data
}
export const useSingleAccountInfo = accountId => {
  return useRPC(
    accountId ? [QUERY_ACCOUNT, 'useSingleAccountInfo', accountId] : null,
    {accountId, g: {nickname: 1}},
    {fallbackData: []},
  ).data
}
export const useGroupAccountList = () => {
  return useRPC(
    [QUERY_GROUP, 'useGroupAccountList'],
    {
      types: [
        ACCOUNT_GROUP_TYPE.HD,
        ACCOUNT_GROUP_TYPE.PK,
        ACCOUNT_GROUP_TYPE.HW,
      ],
      g: {
        eid: 1,
        nickname: 1,
        vault: {type: 1},
        account: {selected: 1, eid: 1},
      },
    },
    {
      fallbackData: [],
    },
  )
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
  const {
    data: {eid: addressId},
  } = useCurrentAddress()
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
