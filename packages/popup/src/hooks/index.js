import {useEffect, useState} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {
  ROUTES,
  ANIMATE_DURING_TIME,
  RPC_METHODS,
  NETWORK_TYPE,
} from '../constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber, isString} from '@fluent-wallet/checks'
import {formatBalance} from '@fluent-wallet/data-format'
import {useIsLocked, useIsZeroGroup} from './useApi'

const {
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
  WALLET_GET_CURRENT_NETWORK,
  WALLET_GET_CURRENT_ACCOUNT,
  WALLET_GET_PENDING_AUTH_REQUEST,
} = RPC_METHODS
const {HOME} = ROUTES

export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()
  const zeroGroup = useIsZeroGroup()
  const lockedData = useIsLocked()

  useEffect(() => {
    if ((zeroGroup && !createdPassword) || (!zeroGroup && lockedData)) {
      history.push(HOME)
    }
  }, [createdPassword, history, zeroGroup, lockedData])
}

export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

export const useSlideAnimation = show => {
  const [wrapperAnimateStyle, setWrapperAnimateStyle] = useState('')
  useEffect(() => {
    if (show) {
      return setWrapperAnimateStyle('animate-slide-up block')
    }
    if (wrapperAnimateStyle && !show) {
      setWrapperAnimateStyle('animate-slide-down')

      const timer = setTimeout(() => {
        setWrapperAnimateStyle('')
        clearTimeout(timer)
      }, ANIMATE_DURING_TIME)
    }
  }, [show, wrapperAnimateStyle])
  return wrapperAnimateStyle
}

export const useFontSize = (
  targetRef,
  hiddenRef,
  maxWidth,
  value,
  initialFontSize = 14,
) => {
  useEffect(() => {
    const hiddenDom = hiddenRef.current
    const targetDom = targetRef.current
    const contentWidth = hiddenDom.offsetWidth
    if (contentWidth > maxWidth) {
      const fontSize = (maxWidth / contentWidth) * initialFontSize
      targetDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    } else {
      targetDom.style.fontSize = `${initialFontSize}px`
    }
  }, [targetRef, hiddenRef, maxWidth, value, initialFontSize])
}

// TODO: refactor batch balance
const getAddressParams = (accountGroups, networkId) => {
  let addressParams = []
  if (isNumber(networkId) && accountGroups?.length) {
    addressParams = accountGroups.reduce(
      (acc, cur) =>
        acc.concat(
          cur.account
            ? cur.account.map(({eid: accountId}) => ({networkId, accountId}))
            : [],
        ),
      [],
    )
  }
  return addressParams
}

const getAddressDataWithAccountId = (addressParams, addressData) => {
  if (Object.prototype.toString.call(addressData) === '[Object Object]') {
    addressData = [addressData]
  }
  if (addressData.length && addressParams.length) {
    return addressParams.reduce((acc, cur, idx) => {
      acc[cur['accountId']] = addressData[idx]
      return acc
    }, {})
  }

  return null
}

const formatAccountGroupData = ({
  accountGroups,
  balanceData,
  addressDataWithAccountId,
  token = '0x0',
  returnBalance = true,
}) => {
  let ret = []
  if (
    accountGroups?.length &&
    addressDataWithAccountId &&
    ((returnBalance && Object.keys(balanceData).length) || !returnBalance)
  ) {
    accountGroups.forEach(({nickname, account}, groupIndex) => {
      ret.push({nickname, account: []})
      if (account) {
        account.forEach(({nickname, eid}) => {
          const address =
            addressDataWithAccountId[eid]?.base32 ||
            addressDataWithAccountId[eid]?.hex ||
            ''
          const accountData = {nickname, eid, address}
          if (returnBalance) {
            accountData['balance'] = formatBalance(
              balanceData?.[address]?.[token],
            )
          }
          ret[groupIndex]['account'].push({
            ...accountData,
          })
        })
      }
    })
  }
  return ret
}

export const useSingleAddressByNetworkId = (accountId, networkId) => {
  const {data, error} = useRPC(
    isNumber(accountId) && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, accountId, networkId]
      : null,
    {accountId, networkId},
    {fallbackData: {}},
  )
  return {data: data || {}, error}
}

export const useMultipleAddressByNetworkId = (params, networkId) => {
  const {data, error} = useRPC(
    params.length && isNumber(networkId)
      ? [WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId]
      : null,
    params,
    {fallbackData: []},
  )
  return {
    data:
      Object.prototype.toString.call(data) === '[object Object]'
        ? [{...data}]
        : data || [],
    error,
  }
}

export const useAccountGroupBatchBalance = networkId => {
  const {data: accountGroups} = useRPC([WALLET_GET_ACCOUNT_GROUP])
  const addressParams = getAddressParams(accountGroups, networkId)

  // TODO: should mutate when add network
  const {data: addressData} = useMultipleAddressByNetworkId(
    addressParams,
    networkId,
  )
  const {data: balanceData} = useRPC(
    addressData?.length ? [WALLET_GET_BALANCE, networkId] : null,
    {
      users: addressData.map(data => data?.base32 || data?.hex).filter(Boolean),
      tokens: ['0x0'],
    },
    {fallbackData: {}},
  )
  const addressDataWithAccountId = getAddressDataWithAccountId(
    addressParams,
    addressData,
  )

  return formatAccountGroupData({
    accountGroups,
    balanceData,
    addressDataWithAccountId,
  })
}

// TODO refactor end
export const useAccountGroupAddress = networkId => {
  const {data: accountGroups} = useRPC([WALLET_GET_ACCOUNT_GROUP], undefined)
  const addressParams = getAddressParams(accountGroups, networkId)
  const {data: addressData} = useMultipleAddressByNetworkId(
    addressParams,
    networkId,
  )
  const addressDataWithAccountId = getAddressDataWithAccountId(
    addressParams,
    addressData,
  )
  return {
    addressDataWithAccountId: addressDataWithAccountId,
    accountData: formatAccountGroupData({
      accountGroups,
      addressDataWithAccountId,
      returnBalance: false,
    }),
  }
}

export const useCurrentInfo = () => {
  const {data: currentNetwork} = useRPC(
    [WALLET_GET_CURRENT_NETWORK],
    undefined,
    {
      fallbackData: {},
    },
  )
  const {
    eid: networkId,
    type: networkType,
    ticker,
    icon: networkIcon,
    name: networkName,
  } = currentNetwork
  const {data: currentAccount} = useRPC(
    [WALLET_GET_CURRENT_ACCOUNT],
    undefined,
    {
      fallbackData: {},
    },
  )
  const {eid: accountId, nickname} = currentAccount || {}
  const {data: accountAddress} = useSingleAddressByNetworkId(
    accountId,
    networkId,
  )
  const {base32, hex} = accountAddress
  const address =
    networkType === NETWORK_TYPE.CFX
      ? base32
      : networkType === NETWORK_TYPE.ETH
      ? hex
      : ''
  return {
    nickname,
    address,
    ticker,
    accountId,
    networkId,
    networkIcon,
    networkName,
    networkType,
  }
}

export const usePendingAuthReq = (canSendReq = true) => {
  const {data: pendingAuthReq, error: pendingReqError} = useRPC(
    canSendReq ? [WALLET_GET_PENDING_AUTH_REQUEST] : null,
  )
  return {pendingAuthReq, pendingReqError}
}

export const useBalance = (
  accountId,
  networkId,
  tokenContractAddress = '0x0',
) => {
  const {
    data: {base32, hex},
  } = useSingleAddressByNetworkId(accountId, networkId)
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
  const {data: currentNetwork} = useRPC(
    [WALLET_GET_CURRENT_NETWORK],
    undefined,
    {
      fallbackData: {},
    },
  )
  return currentNetwork?.type === 'cfx'
}

export const useIsEth = () => {
  const {data: currentNetwork} = useRPC(
    [WALLET_GET_CURRENT_NETWORK],
    undefined,
    {
      fallbackData: {},
    },
  )
  return currentNetwork?.type === 'eth'
}
