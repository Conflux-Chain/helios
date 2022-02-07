import {addHexPrefix, toBuffer} from '@fluent-wallet/utils'
import {encode as encodeCfxAddress} from '@fluent-wallet/base32-address'
import {hashMessage as ethHashPersonalMessage} from '@ethersproject/hash'
import {
  SigningKey,
  recoverPublicKey as ethRecoverPublicKey,
} from '@ethersproject/signing-key'
import {
  Transaction as CfxTransaction,
  PersonalMessage as CfxPersonalMessage,
  Message as CfxMessage,
  sign as cfxSDKSign,
} from 'js-conflux-sdk'
import {joinSignature} from '@ethersproject/bytes'
import {
  Wallet as EthWallet,
  verifyMessage as verifyEthPersonalSign,
} from '@ethersproject/wallet'
import {
  computeAddress as ethComputeAddress,
  serialize as serializeUnsignedETHTransaction,
} from '@ethersproject/transactions'
import {getMessage as cip23GetMessage} from 'cip-23'
import {TypedDataUtils} from 'eth-sig-util'
import {keccak256} from '@ethersproject/keccak256'

export const hashPersonalMessage = (type, message) =>
  type === 'cfx'
    ? CfxPersonalMessage.personalHash(message)
    : ethHashPersonalMessage(message)

export async function personalSign(type, privateKey, message) {
  return type === 'cfx'
    ? CfxPersonalMessage.sign(addHexPrefix(privateKey), message)
    : await new EthWallet(addHexPrefix(privateKey)).signMessage(message)
}

export function recoverPersonalSignature(type, signature, message, netId) {
  if (type === 'cfx') {
    const pub = CfxPersonalMessage.recover(signature, message)
    const addr = cfxSDKSign.publicKeyToAddress(toBuffer(pub))
    return encodeCfxAddress(addr, netId)
  }

  return verifyEthPersonalSign(message, signature)
}

export function hashTypedData(type, typedData) {
  return keccak256(
    cip23GetMessage(
      typedData,
      false,
      type === 'cfx' ? 'CIP23Domain' : 'EIP712Domain',
    ),
  )
}

// v4
export async function signTypedData_v4(type, privateKey, typedData) {
  if (type === 'cfx') {
    const hashedMessage = keccak256(
      cip23GetMessage(
        typedData,
        false,
        type === 'cfx' ? 'CIP23Domain' : 'EIP712Domain',
      ),
    )
    const signature = CfxMessage.sign(
      toBuffer(privateKey),
      toBuffer(hashedMessage),
    )
    return signature
  }

  const digest = TypedDataUtils.sign(typedData)
  const signature = new SigningKey(addHexPrefix(privateKey)).signDigest(digest)
  return joinSignature(signature)
}

export function recoverTypedSignature_v4(type, signature, typedData, netId) {
  if (type === 'cfx') {
    const hashedMessage = keccak256(
      cip23GetMessage(
        typedData,
        false,
        type === 'cfx' ? 'CIP23Domain' : 'EIP712Domain',
      ),
    )
    return encodeCfxAddress(
      cfxSDKSign.publicKeyToAddress(
        toBuffer(CfxMessage.recover(signature, hashedMessage)),
      ),
      netId,
    )
  }

  const digest = TypedDataUtils.sign(typedData)
  const pub = ethRecoverPublicKey(digest, signature)
  return ethComputeAddress(pub)
}

export const ethEcdsaSign = (hash, pk) =>
  new SigningKey(addHexPrefix(pk)).sign(addHexPrefix(hash))
export const cfxEcdsaSign = (hash, pk) =>
  CfxMessage.sign(toBuffer(pk), toBuffer(hash))

export const ecdsaSign = (type, hash, privateKey) =>
  type === 'cfx'
    ? cfxEcdsaSign(hash, privateKey)
    : ethEcdsaSign(hash, privateKey)

export const ethEcdsaRecover = (hash, signature) =>
  ethRecoverPublicKey(addHexPrefix(hash), signature)
export const cfxEcdsaRecover = (hash, signature, netId) =>
  encodeCfxAddress(
    cfxSDKSign.publicKeyToAddress(
      toBuffer(CfxMessage.recover(hash, signature)),
    ),
    netId,
  )

export const ecdsaRecover = (type, hash, sig, netId) =>
  type === 'cfx'
    ? cfxEcdsaRecover(hash, sig, netId)
    : ethEcdsaRecover(hash, sig)

export const cfxSignTransaction = (tx, pk, netId) => {
  const transaction = new CfxTransaction(tx)
  return transaction.sign(pk, netId).serialize()
}

export const ethSignTransaction = (tx, pk) => {
  pk = addHexPrefix(pk)
  const signature = new SigningKey(pk).signDigest(
    keccak256(serializeUnsignedETHTransaction(tx)),
  )
  return serializeUnsignedETHTransaction(tx, signature)
}

export const cfxRecoverTransactionToAddress = (tx, {r, s, v}, netId) => {
  const transaction = new CfxTransaction({
    ...tx,
    r: addHexPrefix(r),
    s: addHexPrefix(s),
    v: addHexPrefix(v),
  })

  let pub = transaction.recover()

  return encodeCfxAddress(
    '0x' + cfxSDKSign.publicKeyToAddress(toBuffer(pub)).toString('hex'),
    netId,
  )
}

export const cfxEncodeTx = (tx, shouldStripHexPrefix = false) => {
  const transaction = new CfxTransaction(tx)
  const encoded = transaction.encode(false).toString('hex')
  if (shouldStripHexPrefix) return encoded
  return `0x${encoded}`
}

export const cfxJoinTransactionAndSignature = ({tx, signature: [r, s, v]}) => {
  const transaction = new CfxTransaction({
    ...tx,
    r: addHexPrefix(r),
    s: addHexPrefix(s),
    v: addHexPrefix(v),
  })
  return transaction.serialize()
}

export const getTxHashFromRawTx = txhash => {
  return keccak256(txhash)
}
