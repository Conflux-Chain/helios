import {randomInt} from '@fluent-wallet/utils'
import {HDNode, entropyToMnemonic} from '@ethersproject/hdnode'
import {randomBytes} from '@ethersproject/random'
// https://learnblockchain.cn/2018/09/28/hdwallet
// m / purpose' / coin' / account' / change / address_index
// m/44 是固定的 503 是cfx 后面2个一个是account 的index 一个是address 的index
const DEFAULT_HD_PATH = `m/44'/503'/0'/0`

export const generateMnemonic = () => entropyToMnemonic(randomBytes(16))

export const defHDKey = mnemonic => {
  const hdnode = HDNode.fromMnemonic(mnemonic)
  return hdnode
}

function randomHDPathIndex() {
  return randomInt(0x80000000)
}

export const randomHDPath = () => {
  return `m/44'/${randomHDPathIndex()}'/${randomHDPathIndex()}'/${randomInt(
    randomHDPathIndex(),
  )}`
}

export const validateHDPath = hdPath => {
  let valid = true
  try {
    const paths = hdPath.split('/')
    valid =
      valid &&
      paths.length === 5 &&
      paths[0] === 'm' &&
      paths[1] === "44'" &&
      paths[2].endsWith("'") &&
      paths[3].endsWith("'")
    valid =
      valid &&
      Boolean(
        HDNode.fromMnemonic(generateMnemonic()).derivePath(paths.join('/')),
      )
  } catch (err) {
    valid = false
  }

  return valid
}

export const getNthAccountOfHDKey = async ({
  mnemonic,
  hdPath = DEFAULT_HD_PATH,
  nth, // start from 0
  only0x1Prefixed = false,
}) => {
  const k = defHDKey(mnemonic)
  const paths = hdPath.split('/')
  const result = {}
  let count = 0,
    idx = 0

  while (count <= nth) {
    await new Promise(resolve => setTimeout(resolve, 1))
    paths[5] = idx++
    const newNode = k.derivePath(paths.join('/'))
    result.address = newNode.address.toLowerCase()
    result.privateKey = newNode.privateKey
    if (only0x1Prefixed && result.address.startsWith('0x1')) count++
    if (!only0x1Prefixed) count++
  }
  result.index = idx - 1

  return result
}
