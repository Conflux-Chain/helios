import {secp256k1} from '@noble/curves/secp256k1'
import {arrayify, hexlify, splitSignature} from '@ethersproject/bytes'

function parsePrivateKey(privateKey) {
  try {
    const key = arrayify(privateKey)
    if (key.length === 32 && secp256k1.utils.isValidSecretKey(key)) return key
  } catch {
    // ethers includes the input in parse errors. Do not forward it as a cause.
  }
  throw new Error('Invalid secp256k1 private key')
}

// Callers supply an already-hashed Ethereum digest, never a message to hash.
export function signDigest(privateKey, digest) {
  const hash = arrayify(digest)
  if (hash.length !== 32) throw new Error('Expected a 32-byte signing digest')
  const key = parsePrivateKey(privateKey)
  const sig = secp256k1.sign(hash, key, {prehash: false, lowS: true})
  const compact = sig.toCompactRawBytes()
  return splitSignature({
    r: hexlify(compact.subarray(0, 32)),
    s: hexlify(compact.subarray(32)),
    recoveryParam: sig.recovery,
  })
}
