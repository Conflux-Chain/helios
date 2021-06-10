import {mnemonicToSeed} from 'bip39'
import {hdkey} from 'ethereumjs-wallet'
import {randomInt} from '@cfxjs/utils'
import {HDKey} from 'ethereum-cryptography/hdkey.js'
import {Buffer} from 'buffer'

const DEFAULT_HD_PATH = `m/44'/503'/0'/0`

export const defHDKey = async (mnemonic, hdPath = DEFAULT_HD_PATH) => {
  const seed = await mnemonicToSeed(mnemonic)
  return hdkey.fromMasterSeed(seed).derivePath(hdPath)
}

function randomHDPathIndex() {
  return randomInt(HDKey.HARDENED_OFFSET)
}

export const randomHDPath = () => {
  return `m/44'/${randomHDPathIndex()}'/${randomHDPathIndex()}'/${randomInt(
    randomHDPathIndex(),
  )}`
}

export const validateHDPath = hdPath => {
  let valid = true
  try {
    const levels = hdPath.split('/')
    valid =
      valid &&
      levels.length === 5 &&
      levels[0] === 'm' &&
      levels[1] === "44'" &&
      levels[2].endsWith("'") &&
      levels[3].endsWith("'")
    valid =
      valid &&
      Boolean(
        hdkey
          .fromMasterSeed(
            Buffer.from(
              // use this to avoid async validator https://github.com/metosin/malli/issues/426
              'df37c5b5fc335f2b448457104a591b0b8792ae4a60c484879d0114b84ca78b1b82503103b489e9087241cc4838561f2dcb43652702d58f8c45a3fa52d04696c3',
              'hex',
            ),
          )
          .derivePath(hdPath),
      )
  } catch (err) {
    valid = false
  }

  return valid
}

export const getNthAccountOfHDKey = async ({
  mnemonic,
  hdPath,
  nth, // start from 0
  only0x1Prefixed = false,
}) => {
  const k = await defHDKey(mnemonic, hdPath)
  const result = {}
  let count = 0,
    idx = 0

  while (count <= nth) {
    const newWallet = k.deriveChild(idx++).getWallet()
    result.address = '0x' + newWallet.getAddress().toString('hex')
    result.privateKey = '0x' + newWallet.getPrivateKey().toString('hex')
    if (only0x1Prefixed && result.address.startsWith('0x1')) count++
    if (!only0x1Prefixed) count++
  }
  result.index = idx - 1

  return result
}
