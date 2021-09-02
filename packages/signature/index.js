import {addHexPrefix, toBuffer} from '@cfxjs/utils'
import {encode as encodeCfxAddress} from '@cfxjs/base32-address'
import {Buffer} from 'buffer'
import {hashMessage as ethHashPersonalMessage} from '@ethersproject/hash'
import {
  SigningKey,
  recoverPublicKey as ethRecoverPublicKey,
} from '@ethersproject/signing-key'
import {
  PersonalMessage as CfxPersonalMessage,
  Message as CfxMessage,
  sign as cfxSDKSign,
} from 'js-conflux-sdk'
import {joinSignature} from '@ethersproject/bytes'
import {
  Wallet as EthWallet,
  verifyMessage as verifyEthPersonalSign,
} from '@ethersproject/wallet'
import {computeAddress as ethComputeAddress} from '@ethersproject/transactions'
import {getMessage as cip23GetMessage} from 'cip-23'
import {TypedDataUtils} from 'eth-sig-util'

export const hashPersonalMessage = (type, message) =>
  type === 'cfx'
    ? CfxPersonalMessage.personalHash(message)
    : ethHashPersonalMessage(message)

export async function personalSign(type, privateKey, message) {
  return type === 'cfx'
    ? CfxPersonalMessage.sign(addHexPrefix(privateKey), Buffer.from(message))
    : await new EthWallet(addHexPrefix(privateKey)).signMessage(message)
}

export function recoverPersonalSignature(type, signature, message, netId) {
  if (type === 'cfx') {
    const pub = CfxPersonalMessage.recover(signature, Buffer.from(message))
    const addr = cfxSDKSign.publicKeyToAddress(toBuffer(pub))
    return encodeCfxAddress(addr, netId)
  }

  return verifyEthPersonalSign(message, signature)
}

export async function hashTypedData(type, typedData) {
  return cip23GetMessage(
    typedData,
    true,
    type === 'cfx' ? 'CIP23Domain' : 'EIP712Domain',
  )
}

// v4
export async function signTypedData_v4(type, privateKey, typedData) {
  if (type === 'cfx') {
    const hashedMessage = cip23GetMessage(typedData, true).toString('hex')
    return cfxSDKSign.ecdsaSign(hashedMessage, toBuffer(privateKey))
  }

  const digest = TypedDataUtils.sign(typedData)
  const signature = new SigningKey(addHexPrefix(privateKey)).signDigest(digest)
  return joinSignature(signature)
}

export function recoverTypedSignature_v4(type, signature, typedData) {
  if (type === 'cfx') {
    const hashedMessage = cip23GetMessage(typedData, true).toString('hex')
    return CfxMessage.recover(signature, hashedMessage)
  }

  const digest = TypedDataUtils.sign(typedData)
  const pub = ethRecoverPublicKey(digest, signature)
  return ethComputeAddress(pub)
}

export const ethEcdsaSign = (hash, pk) =>
  new SigningKey(addHexPrefix(pk)).sign(addHexPrefix(hash))
export const cfxEcdsaSign = (hash, pk) =>
  cfxSDKSign.ecdsaSign(toBuffer(hash), toBuffer(pk))

export const ecdsaSign = (type, hash, privateKey) =>
  type === 'cfx'
    ? cfxEcdsaSign(hash, privateKey)
    : ethEcdsaSign(hash, privateKey)

export const ethEcdsaRecover = (hash, signature) =>
  ethRecoverPublicKey(addHexPrefix(hash), signature)
export const cfxEcdsaRecover = (hash, signature) =>
  cfxSDKSign.ecdsaRecover(toBuffer(hash), signature)

export const ecdsaRecover = (type, hash, sig) =>
  type === 'cfx' ? cfxEcdsaRecover(hash, sig) : ethEcdsaRecover(hash, sig)
