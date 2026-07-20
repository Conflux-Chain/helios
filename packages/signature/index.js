import {
  addHexPrefix,
  stripHexPrefix,
  prepareEip7702AuthorizationRequests,
  toBuffer,
  toHexQuantity,
} from '@fluent-wallet/utils'
import {encode as encodeCfxAddress} from '@fluent-wallet/base32-address'
import {Mainnet, Hardfork, createCustomCommon} from '@ethereumjs/common'
import {hashMessage as ethHashPersonalMessage} from '@ethersproject/hash'
import {
  bytesToHex,
  eoaCode7702AuthorizationHashedMessageToSign,
  hexToBytes,
} from '@ethereumjs/util'
import {createTx, createTxFromRLP} from '@ethereumjs/tx'
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
  // Wallet as EthWallet,
  verifyMessage as verifyEthPersonalSign,
} from '@ethersproject/wallet'
import {
  recoverAddress as recoverEthAddress,
  computeAddress as ethComputeAddress,
  serialize as serializeETHTransaction,
} from '@ethersproject/transactions'
import {getMessage as cip23GetMessage, getStructHash} from 'cip-23'
import {keccak256} from '@ethersproject/keccak256'

export {prepareEip7702AuthorizationRequests}

export const hashPersonalMessage = (type, message) =>
  type === 'cfx'
    ? CfxPersonalMessage.personalHash(message)
    : ethHashPersonalMessage(message)

export async function personalSign(type, privateKey, message) {
  return type === 'cfx'
    ? CfxPersonalMessage.sign(addHexPrefix(privateKey), message)
    : (await import('eth-sig-util')).default.personalSign(
        toBuffer(addHexPrefix(privateKey)),
        {
          data: message,
        },
      )
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
      toBuffer(addHexPrefix(privateKey)),
      toBuffer(hashedMessage),
    )
    return signature
  }

  const {TypedDataUtils} = (await import('eth-sig-util')).default
  const digest = TypedDataUtils.sign(typedData, true)
  const signature = new SigningKey(addHexPrefix(privateKey)).signDigest(digest)
  return joinSignature(signature)
}

export async function recoverTypedSignature_v4(
  type,
  signature,
  typedData,
  netId,
) {
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

  const {TypedDataUtils} = (await import('eth-sig-util')).default
  const digest = TypedDataUtils.sign(typedData, true)
  const pub = ethRecoverPublicKey(digest, signature)
  return ethComputeAddress(pub)
}

export async function getLedgerTypedDataPayload(type, typedData) {
  if (type === 'eth') {
    const {TypedDataUtils} = (await import('eth-sig-util')).default
    const sanitized = TypedDataUtils.sanitizeData(typedData)
    const domainHash = TypedDataUtils.hashStruct(
      'EIP712Domain',
      sanitized.domain,
      sanitized.types,
      true,
    )
    const messageHash = TypedDataUtils.hashStruct(
      sanitized.primaryType,
      sanitized.message,
      sanitized.types,
      true,
    )
    return {
      typedDataJSON: sanitized,
      domainHashHex: stripHexPrefix(domainHash.toString('hex')),
      messageHashHex: stripHexPrefix(messageHash.toString('hex')),
    }
  }

  const domainHash = getStructHash(typedData, 'CIP23Domain', typedData.domain)
  const messageHash = getStructHash(
    typedData,
    typedData.primaryType,
    typedData.message,
  )
  return {
    typedDataJSON: typedData,
    domainHashHex: stripHexPrefix(domainHash.toString('hex')),
    messageHashHex: stripHexPrefix(messageHash.toString('hex')),
  }
}

export const ethEcdsaSign = (hash, pk) =>
  new SigningKey(addHexPrefix(pk)).sign(addHexPrefix(hash))
export const cfxEcdsaSign = (hash, pk) =>
  CfxMessage.sign(toBuffer(addHexPrefix(pk)), toBuffer(hash))

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

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7702.md#behavior
export const hashEip7702Authorization = ({chainId, contractAddress, nonce}) => {
  return bytesToHex(
    eoaCode7702AuthorizationHashedMessageToSign({
      chainId: toHexQuantity(chainId),
      address: addHexPrefix(contractAddress).toLowerCase(),
      nonce: toHexQuantity(nonce),
    }),
  )
}

export const signEip7702Authorization = (authorization, privateKey) => {
  const authorizationHash = hashEip7702Authorization(authorization)
  const signature = new SigningKey(addHexPrefix(privateKey)).signDigest(
    authorizationHash,
  )

  return {
    r: signature.r.toLowerCase(),
    s: signature.s.toLowerCase(),
    yParity: `0x${signature.recoveryParam}`,
  }
}

export const signEip7702AuthorizationList = (authorizationList, privateKey) => {
  return authorizationList.map(authorization => ({
    ...authorization,
    ...signEip7702Authorization(
      {
        chainId: authorization.chainId,
        contractAddress: authorization.address,
        nonce: authorization.nonce,
      },
      privateKey,
    ),
  }))
}

export const ethSignEip7702Transaction = (tx, privateKey) => {
  const unsignedTransaction = createEip7702Transaction(tx)
  const signedTransaction = unsignedTransaction.sign(
    hexToBytes(addHexPrefix(privateKey)),
  )

  return addHexPrefix(bytesToHex(signedTransaction.serialize()))
}

export const ethEncodeEip7702Transaction = tx => {
  return addHexPrefix(
    bytesToHex(createEip7702Transaction(tx).getMessageToSign()),
  )
}

export const cfxSignTransaction = (tx, pk, netId) => {
  const transaction = new CfxTransaction(tx)
  return transaction.sign(pk, netId).serialize()
}

/**
 * Decodes a signed raw Ethereum transaction.
 *
 * @param {string} rawTx
 * @param {string} chainId
 * @returns {Object} Decoded transaction.
 */
export const decodeEthRawTransaction = (rawTx, chainId) => {
  const common = createCustomCommon({chainId}, Mainnet, {
    hardfork: Hardfork.Prague,
    eips: [7702],
  })
  const transaction = createTxFromRLP(hexToBytes(rawTx), {common})

  return {
    ...transaction.toJSON(),
    from: transaction.getSenderAddress().toString(),
  }
}

export const ethSignTransaction = (tx, pk) => {
  pk = addHexPrefix(pk)
  const signature = new SigningKey(pk).signDigest(
    keccak256(serializeETHTransaction(tx)),
  )
  return serializeETHTransaction(tx, signature)
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

export const ethRecoverTransactionToAddress = (tx, {r, s, v}) => {
  const addr = recoverEthAddress(keccak256(serializeETHTransaction(tx)), {
    r: addHexPrefix(r),
    s: addHexPrefix(s),
    v: addHexPrefix(v),
  })
  return addr
}

export const cfxEncodeTx = (tx, shouldStripHexPrefix = false) => {
  const transaction = new CfxTransaction(tx)
  const encoded = transaction.encode(false).toString('hex')
  if (shouldStripHexPrefix) return encoded
  return `0x${encoded}`
}

export const ethEncodeTx = (tx, shouldStripHexPrefix = false) => {
  tx = serializeETHTransaction(tx)
  if (shouldStripHexPrefix) return stripHexPrefix(tx)
  return tx
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

export const ethJoinTransactionAndSignature = ({tx, signature: [r, s, v]}) => {
  return serializeETHTransaction(
    tx,
    joinSignature({r: addHexPrefix(r), s: addHexPrefix(s), v: addHexPrefix(v)}),
  )
}

export const getTxHashFromRawTx = txhash => {
  return keccak256(txhash)
}

function createEip7702Transaction(tx) {
  const {gas, gasLimit, ...restTx} = tx
  const common = createCustomCommon(
    {chainId: parseInt(tx.chainId, 16)},
    Mainnet,
    {
      hardfork: Hardfork.Prague,
      eips: [7702],
    },
  )

  return createTx(
    {
      ...restTx,
      gasLimit: gasLimit ?? gas,
      type: 4,
    },
    {common},
  )
}
