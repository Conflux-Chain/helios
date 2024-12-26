import {useEffect, useState} from 'react'
import {
  isNumber,
  isString,
  isArray,
  isUndefined,
  isObject,
} from '@fluent-wallet/checks'
import {useRPC} from '@fluent-wallet/use-rpc'

import {NETWORK_TYPE, RPC_METHODS, PAGE_LIMIT} from '../constants'
import {validateAddress, flatArray} from '../utils'

const {
  QUERY_GROUP,
  QUERY_BALANCE,
  QUERY_ADDRESS,
  QUERY_ACCOUNT,
  QUERY_ACCOUNT_LIST,
  QUERY_TOKEN,
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
  WALLET_GET_CURRENT_DAPP,
  WALLET_GET_PENDING_AUTH_REQUEST,
  WALLET_ZERO_ACCOUNT_GROUP,
  WALLET_GET_NETWORK,
  WALLET_IS_LOCKED,
  WALLET_METADATA_FOR_POPUP,
  ACCOUNT_GROUP_TYPE,
  WALLET_DETECT_ADDRESS_TYPE,
  WALLETDB_REFETCH_BALANCE,
  WALLET_VALIDATE_20TOKEN,
  QUERY_TXLIST,
  QUERY_SINGLE_TX,
  WALLET_GET_BLOCKCHAIN_EXPLORER_URL,
  WALLET_GET_FLUENT_METADATA,
  CFX_GET_MAX_GAS_LIMIT,
  WALLET_GET_PREFERENCES,
  WALLET_QUERY_MEMO,
  WALLET_QUERY_RECENT_TRADING_ADDRESS,
  WALLET_NETWORK1559COMPATIBLE,
  WALLET_REFETCH_TXLIST,
} = RPC_METHODS

export const useCurrentAddress = (notSendReq = false) => {
  const {data, mutate} = useAddress({
    selected: true,
    stop: notSendReq,
    deps: 'useCurrentAddress',
  })
  return {data, mutate}
}

export const useAddress = (opts = {}) => {
  const {stop, deps, ...params} = opts
  let newDeps = deps || []
  if (!Array.isArray(newDeps)) newDeps = [newDeps]
  return useRPC(
    stop
      ? null
      : [QUERY_ADDRESS, 'useAddress', ...newDeps].concat(
          ...Object.entries(params),
        ),
    {
      ...params,
      g: {
        value: 1,
        hex: 1,
        eid: 1,
        nativeBalance: 1,
        _account: {nickname: 1, eid: 1, _accountGroup: {vault: {type: 1}}},
        network: {
          gasBuffer: 1,
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
}

export const useCurrentTicker = () => {
  const {
    data: {
      network: {ticker},
    },
  } = useCurrentAddress()

  return ticker
}

export const useCurrentDapp = () => {
  const {locked: isLocked} = useDataForPopup()

  const {
    data: {eid: addressId},
  } = useCurrentAddress()

  const {data, mutate} = useRPC(
    isLocked === false && isNumber(addressId)
      ? [WALLET_GET_CURRENT_DAPP, addressId]
      : null,
    undefined,
    {
      fallbackData: {},
    },
  )
  return {data, mutate}
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
    [WALLET_GET_NETWORK, NETWORK_TYPE.CFX],
    {
      type: NETWORK_TYPE.CFX,
    },
    {fallbackData: []},
  )
  return cfxNetWork
}

export const useEthNetwork = () => {
  const {data: ethNetWork} = useRPC(
    [WALLET_GET_NETWORK, NETWORK_TYPE.ETH],
    {
      type: NETWORK_TYPE.ETH,
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
  const {zeroGroup} = useDataForPopup()
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
  const {zeroGroup} = useDataForPopup()
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
  const {zeroGroup} = useDataForPopup()
  const {data: group} = useRPC(
    zeroGroup === false ? [WALLET_GET_ACCOUNT_GROUP] : null,
    undefined,
    {
      fallbackData: [],
    },
  )
  return group
}

/************************************************************************************************
unused functions
because locked and zeroGroup has logic relationship
************************************************************************************************/
export const useIsLocked = () => {
  const {data: lockedData} = useRPC([WALLET_IS_LOCKED])
  return lockedData
}

export const useIsZeroGroup = () => {
  const {data: zeroGroup} = useRPC([WALLET_ZERO_ACCOUNT_GROUP])
  return zeroGroup
}
/************************************************************************************************
end
************************************************************************************************/

export const usePendingAuthReq = () => {
  const {locked: isLocked} = useDataForPopup()
  const {data: pendingAuthReq} = useRPC(
    !isLocked ? [WALLET_GET_PENDING_AUTH_REQUEST] : null,
  )
  return isLocked ? [] : pendingAuthReq
}

export const useDataForPopup = () => {
  const {data} = useRPC([WALLET_METADATA_FOR_POPUP], undefined, {
    fallbackData: {},
  })
  const {locked, zeroGroup, pendingAuthReq} = data
  return {locked, zeroGroup, pendingAuthReq: locked ? [] : pendingAuthReq}
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
  const userAddress = address
    ? typeof address === 'string'
      ? [address]
      : address
    : null
  const {data: balance} = useRPC(
    userAddress && isNumber(networkId) && isString(tokenContractAddress)
      ? [WALLET_GET_BALANCE, networkId, tokenContractAddress, ...userAddress]
      : null,
    {
      users: userAddress,
      tokens: [tokenContractAddress],
    },
    {fallbackData: {}},
  )
  return balance
}

export const useNetworkTypeIsCfx = (...args) => {
  return useCurrentAddress(...args).data?.network?.type === NETWORK_TYPE.CFX
}

export const useIsCfxChain = () => {
  const {
    data: {
      network: {
        type,
        ticker: {symbol},
      },
    },
  } = useCurrentAddress()
  return type === NETWORK_TYPE.CFX || symbol?.toLowerCase() === NETWORK_TYPE.CFX
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

export const useDbRefetchBalance = (params = {}) => {
  const {type, allNetwork} = params
  const {mutate} = useRPC([WALLETDB_REFETCH_BALANCE, type, allNetwork], params)
  const {mutate: mutateAll} = useRPC(
    [WALLETDB_REFETCH_BALANCE, 'REFETCH_ALL'],
    {type: 'all', allNetwork: true},
    {refreshInterval: 180000},
  )
  return [mutate, mutateAll]
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
  const {
    data: {
      network: {ticker},
    },
  } = useCurrentAddress()
  const {data} = useRPC(
    isNumber(tokenId) ? [QUERY_TOKEN, 'useSingleTokenInfo', tokenId] : null,
    {
      tokenId,
      g: {name: 1, address: 1, symbol: 1, decimals: 1, logoURI: 1},
    },
    {fallbackData: {}, refreshInterval: 0},
  )
  if (tokenId === 'native' || tokenId === '0x0') {
    ticker.logoURI = ticker?.iconUrls?.[0]
    return ticker
  }

  return data || {}
}

export const useValidate20Token = address => {
  const {
    data: {value: userAddress},
  } = useCurrentAddress()
  return useRPC(
    userAddress && address
      ? [WALLET_VALIDATE_20TOKEN, address, userAddress]
      : null,
    {tokenAddress: address, userAddress},
    {
      fallbackData: {valid: false},
      postprocessSuccessData: d => {
        if (!d.valid) return d
        d.address = address
        return d
      },
    },
  )
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

export const useGroupAccountAuthorizedDapps = () => {
  return useRPC([QUERY_GROUP, 'useGroupAccountAuthorizedDapps'], {
    types: [
      ACCOUNT_GROUP_TYPE.HD,
      ACCOUNT_GROUP_TYPE.PK,
      ACCOUNT_GROUP_TYPE.HW,
    ],
    g: {
      nickname: 1,
      vault: {type: 1},
      account: {
        eid: 1,
        nickname: 1,
        address: {
          value: 1,
          hex: 1,
          network: {
            chainId: 1,
          },
        },
        _app: {
          site: {origin: 1, icon: 1, eid: 1},
          eid: 1,
        },
      },
    },
  })
}

export const useValid20Token = address => {
  const {data: token} = useRPC(
    address ? [WALLET_VALIDATE_20TOKEN, address] : null,
    {tokenAddress: address},
    {
      fallbackData: {},
      postprocessSuccessData: d => (address ? {...(d || {}), address} : d),
    },
  )
  return token
}

export const useTxList = ({params, includeExternalTx = false}) => {
  const {
    data: {eid: addressId},
  } = useCurrentAddress()

  useDbRefetchExternalTxList({
    addressId,
    stop: !includeExternalTx,
  })
  const {data, mutate} = useRPC(
    addressId ? [QUERY_TXLIST, ...Object.values(params), addressId] : null,
    {...params, addressId},
    {
      fallbackData: params?.countOnly ? 0 : {},
    },
  )
  return {data, mutate}
}

export const useSingleTx = hash => {
  const {data, mutate} = useRPC(
    hash ? [QUERY_SINGLE_TX, hash] : null,
    {hash},
    {
      fallbackData: {},
    },
  )
  return {data, mutate}
}

export const useBlockchainExplorerUrl = (params, deps) => {
  let rpcDeps = []
  if (!deps && params) {
    rpcDeps = [...flatArray(Object.values(params))]
  } else {
    rpcDeps = isArray(deps) ? deps : [deps]
  }

  const {data: urlData} = useRPC(
    params ? [WALLET_GET_BLOCKCHAIN_EXPLORER_URL, ...rpcDeps] : null,
    {
      ...params,
    },
    {fallbackData: {address: [], contract: [], token: [], transaction: []}},
  )
  return urlData
}

export const useQueryImportedAddress = networkId => {
  return useRPC(
    networkId ? [QUERY_ADDRESS, 'useQueryImportedAddress', networkId] : null,
    {
      networkId,
      g: {
        hex: 1,
        value: 1,
      },
    },
    {
      postprocessSuccessData: d => {
        if (isArray(d)) {
          let ret = {}
          d.forEach(({hex, value}) => {
            ret[hex] = value
          })
          return ret
        }
        return d
      },
    },
  )
}

export const useAddressTypeInConfirmTx = address => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()
  const {data} = useRPC(
    address && networkId
      ? [QUERY_ADDRESS, 'useAddressTypeInConfirmTx', address, networkId]
      : null,
    {
      value: address,
      networkId,
      g: {
        eid: 1,
        _account: {eid: 1, _accountGroup: {vault: {type: 1}}},
      },
    },
    {
      fallbackData: {
        account: {accountGroup: {vault: {}}},
      },
    },
  )
  return data
}

export const useAccountList = ({
  networkId,
  fuzzy,
  includeHidden = false,
  groupTypes = [
    ACCOUNT_GROUP_TYPE.HD,
    ACCOUNT_GROUP_TYPE.PK,
    ACCOUNT_GROUP_TYPE.HW,
  ],
  getAllNetworkAccount = false,
}) => {
  useDbRefetchBalance()

  let params = {
    includeHidden,
    fuzzy,
    groupTypes,
    addressG: {
      nativeBalance: 1,
      value: 1,
      hex: 1,
      network: {
        ticker: 1,
        type: 1,
        chainId: 1,
      },
    },
    accountG: {
      nickname: 1,
      eid: 1,
      hidden: 1,
      selected: 1,
      _app: {
        site: {origin: 1, icon: 1, eid: 1},
        eid: 1,
      },
    },
    groupG: {
      nickname: 1,
      eid: 1,
      vault: {type: 1, cfxOnly: 1},
    },
  }

  if (!getAllNetworkAccount) {
    params.networkId = networkId
  }

  return useRPC(
    isUndefined(networkId) && !getAllNetworkAccount
      ? null
      : [
          QUERY_ACCOUNT_LIST,
          'useAccountList',
          fuzzy,
          networkId,
          includeHidden,
          getAllNetworkAccount ? 'getAllNetworkAccount' : '',
          ...groupTypes,
        ],
    params,
    {
      fallbackData: {},
    },
  )
}

export const useCfxMaxGasLimit = isCfxChain => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()
  const {data} = useRPC(
    isCfxChain && networkId ? [CFX_GET_MAX_GAS_LIMIT, networkId] : null,
  )
  return data
}

export const useWalletVersion = () => {
  const {data} = useRPC([WALLET_GET_FLUENT_METADATA], undefined, {
    fallbackData: {
      version: '',
      view_version: '',
    },
  })
  return data
}

export const usePreferences = (stop = false) => {
  const {data, mutate} = useRPC(
    stop ? null : [WALLET_GET_PREFERENCES],
    undefined,
    {
      refreshInterval: 0,
    },
  )
  return {data, mutate}
}

export const useCurrentNetworkAddressMemo = (params = {}, stopSend = false) => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()

  const {data, mutate} = useRPC(
    isUndefined(networkId) || stopSend
      ? null
      : [WALLET_QUERY_MEMO, ...Object.values(params), networkId],
    {offset: 0, limit: PAGE_LIMIT, ...params, networkId},
    {
      fallbackData: {},
    },
  )
  return {data, mutate}
}

export const useRecentTradingAddress = (params = {}) => {
  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()

  const {data, mutate} = useRPC(
    isObject(params) && !isUndefined(networkId)
      ? [
          WALLET_QUERY_RECENT_TRADING_ADDRESS,
          ...Object.values(params),
          networkId,
        ]
      : null,
    {offset: 0, limit: PAGE_LIMIT, ...params},
    {
      fallbackData: {},
    },
  )
  return {data, mutate}
}

//get address account nickname or contact memo
export const useAddressNote = (address, stop) => {
  const [noteName, setNoteName] = useState('')

  const {
    data: {
      network: {eid: networkId},
    },
  } = useCurrentAddress()
  const {data: addressData} = useAddress({
    value: address,
    networkId,
    stop: stop || isUndefined(networkId),
  })

  const {data: memoData} = useCurrentNetworkAddressMemo(
    {
      address,
      g: {
        value: 1,
      },
    },
    stop || addressData !== null,
  )

  useEffect(() => {
    setNoteName(
      addressData?.account?.[0]?.nickname || memoData?.data?.[0]?.value || '',
    )
  }, [addressData?.account, memoData?.data])
  return noteName
}

//Whether this network supports EIP1559 TX
export const useNetwork1559Compatible = () => {
  const {data: network1559Compatible} = useRPC([WALLET_NETWORK1559COMPATIBLE])
  return network1559Compatible
}

export const useDbRefetchExternalTxList = ({stop = false, addressId}) => {
  return useRPC(
    isUndefined(addressId) || stop ? null : [WALLET_REFETCH_TXLIST, addressId],
  )
}
