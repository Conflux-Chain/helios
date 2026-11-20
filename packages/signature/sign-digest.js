import {secp256k1} from '@noble/curves/secp256k1'
import {arrayify, hexlify, splitSignature} from '@ethersproject/bytes'

// Callers supply an already-hashed Ethereum digest, never a message to hash.
export function signDigest(privateKey, digest) {
  const hash = arrayify(digest)
  const key = arrayify(privateKey)
  if (hash.length !== 32) throw new Error('Expected a 32-byte signing digest')
  if (key.length !== 32) throw new Error('Expected a 32-byte private key')
  const sig = secp256k1.sign(hash, key, {prehash: false, lowS: true})
  const compact = sig.toCompactRawBytes()
  return splitSignature({
    r: hexlify(compact.subarray(0, 32)),
    s: hexlify(compact.subarray(32)),
    recoveryParam: sig.recovery,
  })
}
