import {useEffect, useState} from 'react'
import useGlobalStore from '../stores'
import {useHistory, useLocation} from 'react-router-dom'
import {ROUTES, ANIMATE_DURING_TIME, RPC_METHODS} from '../constants'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'

const {GET_ACCOUNT_GROUP, GET_ACCOUNT_ADDRESS_BY_NETWORK, GET_BALANCE} =
  RPC_METHODS
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

export const useFontSize = (targetRef, hiddenRef, maxWidth, value) => {
  useEffect(() => {
    const hiddenDom = hiddenRef.current
    const targetDom = targetRef.current
    const contentWidth = hiddenDom.offsetWidth
    if (contentWidth > maxWidth) {
      const fontSize = (maxWidth / contentWidth) * 14
      targetDom.style.fontSize = parseInt(fontSize * 100) / 100 + 'px'
    } else {
      targetDom.style.fontSize = '14px'
    }
  }, [targetRef, hiddenRef, maxWidth, value])
}

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

const getBatchAddress = ({
  groupIndex,
  accountIndex,
  accountGroups,
  addressData,
}) => {
  let index
  if (groupIndex == 0) {
    index = accountIndex
  } else {
    index = accountGroups[groupIndex - 1].account.length + accountIndex
  }
  return addressData[index].base32 || addressData[index].hex
}

const getBatchBalanceData = ({
  accountGroups,
  balanceData,
  addressData,
  token = '0x0',
}) => {
  let ret = []
  if (
    accountGroups.length &&
    addressData.length &&
    Object.keys(balanceData).length
  ) {
    accountGroups.forEach(({nickname, account}, groupIndex) => {
      ret.push({nickname, account: []})
      account.forEach(({nickname, eid}, accountIndex) => {
        const address = getBatchAddress({
          groupIndex,
          accountIndex,
          accountGroups,
          addressData,
        })
        ret[groupIndex]['account'].push({
          nickname,
          eid,
          balance: window.BigInt(balanceData[address][token]).toString(),
        })
      })
    })
  }
  return ret
}

export const useAccountGroupBatchBalance = networkId => {
  const {data: accountGroups} = useRPC([GET_ACCOUNT_GROUP], undefined)
  const addressParams = getAddressParams(accountGroups, networkId)

  // TODO: should mutate when add network
  const {data: addressData} = useRPC(
    addressParams.length && isNumber(networkId)
      ? [GET_ACCOUNT_ADDRESS_BY_NETWORK, networkId]
      : null,
    addressParams,
    {fallbackData: []},
  )

  const {data: balanceData} = useRPC(
    addressData.length ? [GET_BALANCE, networkId] : null,
    {
      users: addressData.map(data => data.base32 || data.hex),
      tokens: ['0x0'],
    },
    {fallbackData: {}},
  )

  return getBatchBalanceData({
    accountGroups,
    balanceData,
    addressData,
  })
}
