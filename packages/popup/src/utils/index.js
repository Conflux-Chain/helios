import BN from 'bn.js'
import {stripHexPrefix} from '@fluent-wallet/utils'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress, isChecksummed, toChecksum} from '@fluent-wallet/account'
import {isArray} from '@fluent-wallet/checks'
import {PASSWORD_REG_EXP, RPC_METHODS, LANGUAGES} from '../constants'
const globalThis = window ?? global
const {
  WALLET_GET_ACCOUNT_GROUP,
  WALLET_METADATA_FOR_POPUP,
  QUERY_ADDRESS,
  WALLET_GET_BALANCE,
  ACCOUNT_GROUP_TYPE,
  WALLET_SET_CURRENT_ACCOUNT,
  QUERY_ACCOUNT_LIST,
} = RPC_METHODS

export function request(...args) {
  const [method, params] = args
  const requestObj = {
    method,
  }
  if (params) {
    requestObj.params = params
  }
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(requestObj)
}

export function shuffle(arr) {
  let arrAdd = [...arr]
  for (let i = 1; i < arrAdd.length; i++) {
    const random = Math.floor(Math.random() * (i + 1))
    ;[arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]]
  }
  return arrAdd
}

export function validatePasswordReg(value) {
  return PASSWORD_REG_EXP.test(value)
}

export function removeAllChild(dom) {
  let child = dom.lastElementChild
  while (child) {
    dom.removeChild(child)
    child = dom.lastElementChild
  }
}
export function jsNumberForAddress(address) {
  if (!address) {
    return address
  }
  const addr = address.slice(2, 10)
  const seed = parseInt(addr, 16)
  return seed
}

export const validateAddress = (address, networkTypeIsCfx, netId) => {
  if (networkTypeIsCfx && !validateBase32Address(address, netId)) {
    return false
  } else if (!networkTypeIsCfx && !isHexAddress(address)) {
    return false
  }
  return true
}

export const validateByEip55 = address => {
  if (address === address.toLowerCase() || address === address.toUpperCase()) {
    return true
  }
  return isChecksummed(address)
}

export const bn16 = x => new BN(stripHexPrefix(x), 16)

export function updateAddedNewAccount(mutate, noAccountBefore, groupType) {
  const promises = []
  if (noAccountBefore) {
    promises.push(mutate([WALLET_METADATA_FOR_POPUP]))
  }
  promises.push(mutate([WALLET_GET_ACCOUNT_GROUP]))
  promises.push(mutate([WALLET_GET_ACCOUNT_GROUP, groupType]))
  return Promise.all(promises)
}

export const transformToTitleCase = str => {
  if (typeof str !== 'string') return ''
  return str.replace(/^\S/, s => s.toUpperCase())
}

export const formatStatus = status => {
  let ret = ''
  switch (status) {
    case -2:
    case -1:
      ret = 'failed'
      break
    case 0:
    case 1:
      ret = 'sending'
      break
    case 2:
    case 3:
      ret = 'pending'
      break
    case 4:
      ret = 'executed'
      break
    case 5:
      ret = 'confirmed'
  }
  return ret
}

export const flatArray = arr => {
  return arr.reduce((pre, value) => {
    return Array.isArray(value)
      ? [...pre, ...flatArray(value)]
      : [...pre, value]
  }, [])
}

export const isKeyOf = (ev, name) => {
  if (ev instanceof Object && name) {
    if (name === 'enter') {
      return (
        ev.key === 'Enter' ||
        ev.code === 'Enter' ||
        ev.keyCode === '13' ||
        ev.which === '13'
      )
    }
    return false
  }
  return false
}

export const getPageType = () => {
  const pageType = document
    .querySelector("meta[name='popup-type']")
    .getAttribute('content')
  return pageType
}

export const formatLocalizationLang = lang =>
  lang?.split?.('-')?.[0] === 'zh'
    ? 'zh'
    : LANGUAGES.includes(lang)
    ? lang
    : 'en'

export function composeRef() {
  let refs = []
  if (arguments.length === 1 && arguments[0] instanceof Array)
    refs = arguments[0]
  else refs = Array.from(arguments)
  return ref => {
    refs.forEach(r => {
      if (r !== null && typeof r === 'object' && 'current' in r) r.current = ref
      if (typeof r === 'function') r(ref)
    })
  }
}

export const updateDbAccountList = (mutate, ...args) =>
  Promise.all(
    args.map(dep => mutate([QUERY_ADDRESS, ...(isArray(dep) ? dep : [dep])])),
  )

export const detectFirefox = () =>
  navigator?.userAgent?.toLowerCase().indexOf('firefox') > -1

export const checkBalance = async (
  txParams,
  token,
  isNativeToken,
  isSendToken,
  sendTokenValue,
  networkTypeIsCfx,
) => {
  const {from, to, gasPrice, gas, value, storageLimit} = txParams
  const storageFeeDrip = bn16(storageLimit)
    .mul(bn16('0xde0b6b3a7640000' /* 1e18 */))
    .divn(1024)
  const gasFeeDrip = bn16(gas).mul(bn16(gasPrice))
  const txFeeDrip = gasFeeDrip.add(storageFeeDrip)
  const {address: tokenAddress} = token
  try {
    const balanceData = await request(WALLET_GET_BALANCE, {
      users: [from],
      tokens: isNativeToken ? ['0x0'] : ['0x0'].concat(tokenAddress),
    })
    const balance = balanceData?.[from]

    if (isSendToken) {
      if (isNativeToken) {
        if (bn16(balance['0x0']).lt(bn16(value).add(txFeeDrip))) {
          return 'balanceIsNotEnough'
        } else {
          return ''
        }
      } else {
        if (bn16(balance[tokenAddress]).lt(bn16(sendTokenValue))) {
          return 'balanceIsNotEnough'
        }
      }
    }
    let willPayCollateral = true,
      willPayTxFee = true
    if (networkTypeIsCfx) {
      const response = await request('cfx_checkBalanceAgainstTransaction', [
        from,
        to,
        gas,
        gasPrice,
        storageLimit,
        'latest_state',
      ])
      willPayCollateral = response?.willPayCollateral
      willPayTxFee = response?.willPayTxFee
    }

    if (
      (bn16(balance['0x0']).lt(txFeeDrip) &&
        willPayTxFee &&
        willPayCollateral) ||
      (bn16(balance['0x0']).lt(storageFeeDrip) && willPayCollateral) ||
      (bn16(balance['0x0']).lt(gasFeeDrip) && willPayTxFee)
    ) {
      return 'gasFeeIsNotEnough'
    } else {
      return ''
    }
  } catch (err) {
    console.error(err)
    return ''
  }
}

export const formatIntoChecksumAddress = address => {
  if (isHexAddress(address)) {
    return toChecksum(address)
  }
  return address
}

export const setEffectiveCurrentAccount = async networkId => {
  const target = await request(QUERY_ACCOUNT_LIST, {
    networkId,
    groupTypes: [ACCOUNT_GROUP_TYPE.HD, ACCOUNT_GROUP_TYPE.PK],
    includeHidden: false,
    accountG: {
      eid: 1,
    },
  })
  const targetAccountId = Object.values(Object.values(target)[0].account)[0].eid
  return request(WALLET_SET_CURRENT_ACCOUNT, [targetAccountId])
}
