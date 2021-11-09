import {useEffect, useState} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {
  ROUTES,
  ANIMATE_DURING_TIME,
  RPC_METHODS,
  NETWORK_TYPE,
} from '../constants'
import {useRPC, useRPCProvider} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'
import {formatBalance} from '@fluent-wallet/data-format'
import {estimate} from '@fluent-wallet/estimate-tx'
import {useIsLocked, useIsZeroGroup, useCurrentNetwork} from './useApi'
import {useAsync} from 'react-use'

const {
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_GET_ACCOUNT_ADDRESS_BY_NETWORK,
  WALLET_GET_BALANCE,
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

export const useEstimateTx = (tx = {}) => {
  const {provider} = useRPCProvider()
  const currentNetwork = useCurrentNetwork() || {type: NETWORK_TYPE.CFX}
  const {type} = currentNetwork
  const {from, to, value, data, nonce} = tx
  const {
    value: rst,
    loading,
    error,
  } = useAsync(async () => {
    if (!provider || !currentNetwork?.netId) return
    return await estimate(tx, {
      type,
      request: provider.request.bind(provider),
      isFluentRequest: true,
      networkId: currentNetwork.netId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, value, data, nonce, currentNetwork.netId])

  if (loading) {
    return {loading}
  }

  if (error) {
    return {error}
  }

  return rst
}
