import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {chan} from '@fluent-wallet/csp'
import {stripHexPrefix} from '@fluent-wallet/utils'
import BN from 'bn.js'
import {isFunction} from '@fluent-wallet/checks'

const ZERO = new BN(0, 10)

export const hasTx = async ({getTxCount, address}) => {
  let rst = false
  try {
    const res = await getTxCount([address])
    if (new BN(stripHexPrefix(res), 16).gt(ZERO)) rst = true
  } catch (err) {} // eslint-disable-line no-empty

  return rst
}

export const hasBalance = async ({getBalance, address}) => {
  let rst = false
  try {
    let res = await getBalance(address)
    res = Object.values(res)[0]
    rst = Object.values(res).reduce((acc, m) => {
      if (acc) return true
      return acc || new BN(stripHexPrefix(m), 16).gt(ZERO)
    }, rst)
  } catch (err) {} // eslint-disable-line no-empty

  return rst
}

const _discoverAccounts = async ({
  getBalance,
  getTxCount,
  mnemonic,
  hdPath,
  startFrom = 0,
  max = 1000,
  only0x1Prefixed = false,
  return0 = false,
  onFindOne,
  c,
}) => {
  const found = []

  for (let i = startFrom; i < startFrom + max; i++) {
    const rst = await getNthAccountOfHDKey({
      mnemonic,
      hdPath,
      nth: i,
      only0x1Prefixed,
    })

    // no request for first addr
    const [txOk, balanceOk] =
      startFrom === 0 && i === 0
        ? [true, true]
        : await Promise.all([
            hasTx({getTxCount, address: rst.address}),
            hasBalance({getBalance, address: rst.address}),
          ])

    // always return the first address
    // nth: the try times starts at 0
    if ((return0 && i === 0) || txOk || balanceOk) {
      if (isFunction(onFindOne)) await onFindOne({...rst, nth: i})
      found.push({...rst, nth: i})
      c.write({...rst, nth: i})
    } else {
      c.close()
      return found
    }
  }

  return found
}

export const discoverAccounts = (args = {}) => {
  const c = chan()
  _discoverAccounts({...args, c})
  return c
}
