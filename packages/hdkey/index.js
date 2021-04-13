import {mnemonicToSeedSync} from 'bip39'
import {hdkey} from 'ethereumjs-wallet'

const DEFAULT_HD_PATH = `m/44'/503'/0'/0`

export const defHDKey = (mnemonic, hdpath = DEFAULT_HD_PATH) =>
  hdkey.fromMasterSeed(mnemonicToSeedSync(mnemonic)).derivePath(hdpath)

export const getNthAccountOfHDKey = ({
  mnemonic,
  hdpath,
  nth,
  only0x1Prefixed = false,
}) => {
  const k = defHDKey(mnemonic, hdpath)
  const result = {}
  let count = 0,
    idx = 0

  while (count <= nth) {
    const newWallet = k.deriveChild(++idx).getWallet()
    result.address = '0x' + newWallet.getAddress().toString('hex')
    result.privateKey = '0x' + newWallet.getPrivateKey().toString('hex')
    if (only0x1Prefixed && result.address.startsWith('0x1')) count++
    if (!only0x1Prefixed) count++
  }
  result.index = count - 1

  return result
}
