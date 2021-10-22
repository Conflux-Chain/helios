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
import {formatHexBalance} from '../utils'

const {
  GET_ACCOUNT_GROUP,
  GET_ACCOUNT_ADDRESS_BY_NETWORK,
  GET_BALANCE,
  GET_CURRENT_NETWORK,
  GET_CURRENT_ACCOUNT,
  GET_PENDING_AUTH_REQ,
} = RPC_METHODS
const {HOME} = ROUTES

export const useCreatedPasswordGuard = () => {
  const createdPassword = useGlobalStore(state => state.createdPassword)
  const history = useHistory()

  useEffect(() => {
    if (!createdPassword) {
      history.push(HOME)
    }
  }, [createdPassword, history])
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
    accountGroups.length &&
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
            accountData['balance'] = formatHexBalance(
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
      ? [GET_ACCOUNT_ADDRESS_BY_NETWORK, accountId, networkId]
      : null,
    {accountId, networkId},
    {fallbackData: {}},
  )
  return {data: data || {}, error}
}

export const useMultipleAddressByNetworkId = (params, networkId) => {
  const {data, error} = useRPC(
    params.length && isNumber(networkId)
      ? [GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId]
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
  const {data: accountGroups} = useRPC([GET_ACCOUNT_GROUP], undefined)
  const addressParams = getAddressParams(accountGroups, networkId)

  // TODO: should mutate when add network
  const {data: addressData} = useMultipleAddressByNetworkId(
    addressParams,
    networkId,
  )
  const {data: balanceData} = useRPC(
    addressData.length ? [GET_BALANCE, networkId] : null,
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

export const useAccountGroupAddress = networkId => {
  const {data: accountGroups} = useRPC([GET_ACCOUNT_GROUP], undefined)
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

export const useCurrentAccount = () => {
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  const {
    eid: networkId,
    type,
    ticker,
    icon: networkIcon,
    name: networkName,
  } = currentNetwork
  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })
  const {eid: accountId} = currentAccount
  const {data: accountAddress} = useSingleAddressByNetworkId(
    accountId,
    networkId,
  )
  const {base32, hex} = accountAddress
  const address =
    type === NETWORK_TYPE.CFX ? base32 : type === NETWORK_TYPE.ETH ? hex : ''
  return {
    ...currentAccount,
    address,
    ticker,
    networkId,
    networkIcon,
    networkName,
  }
}

export const usePendingAuthReq = (canSendReq = true) => {
  const {data: pendingAuthReq, error: pendingReqError} = useRPC(
    canSendReq ? [GET_PENDING_AUTH_REQ] : null,
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
      ? [GET_BALANCE, address, networkId]
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
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  return currentNetwork?.type === 'cfx'
}

export const useIsEth = () => {
  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  return currentNetwork?.type === 'eth'
}
