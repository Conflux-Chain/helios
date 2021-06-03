import {getNthAccountOfHDKey} from '@cfxjs/hdkey'
import {stripHexPrefix} from '@cfxjs/utils'
import BN from 'bn.js'

const ZERO = new BN(0, 10)

export const hasTx = async ({getTxCount, address}) => {
  let rst = false
  try {
    const res = await getTxCount([address])
    if (new BN(stripHexPrefix(res?.result ?? res), 16).gt(ZERO)) rst = true
  } catch (err) {} // eslint-disable-line no-empty

  return rst
}

export const hasBalance = async ({getBalance, address}) => {
  let rst = false
  try {
    const res = await getBalance([address])
    if (new BN(stripHexPrefix(res?.result ?? res), 16).gt(ZERO)) rst = true
  } catch (err) {} // eslint-disable-line no-empty

  return rst
}

export const discoverAccounts = async ({
  getBalance,
  getTxCount,
  mnemonic,
  hdpath,
  max = 10,
  only0x1Prefixed = false,
  onFindOne = () => {},
} = {}) => {
  for (let i = 0; i < max; i++) {
    const rst = await getNthAccountOfHDKey({
      mnemonic,
      hdpath,
      nth: i + 1,
      only0x1Prefixed,
    })

    const [txOk, balanceOk] = await Promise.all([
      hasTx({getTxCount, address: rst.address}),
      hasBalance({getBalance, address: rst.address}),
    ])

    // always return the first address
    if (i === 0 || txOk || balanceOk) onFindOne(rst)
    else return
  }
}
