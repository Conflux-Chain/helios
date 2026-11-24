import {describe, expect, it} from 'vitest'
import {joinSignature} from '@ethersproject/bytes'
import {computeAddress, recoverAddress} from '@ethersproject/transactions'
import {SigningKey} from '@ethersproject/signing-key'
import {signDigest} from './sign-digest.js'

const privateKey = `0x${'46'.repeat(32)}` // public EIP-155 example key

describe('raw Ethereum digest signing', () => {
  it('preserves deterministic signature bytes and sender recovery', () => {
    const reference = new SigningKey(privateKey)
    for (const digest of [new Uint8Array(32), `0x${'42'.repeat(32)}`]) {
      const result = signDigest(privateKey, digest)
      expect(joinSignature(result)).toBe(
        joinSignature(reference.signDigest(digest)),
      )
      expect(recoverAddress(digest, result)).toBe(computeAddress(privateKey))
    }
  })

  it('rejects a non-32-byte digest rather than signing a different value', () => {
    expect(() => signDigest(privateKey, new Uint8Array(31))).toThrow(
      'Expected a 32-byte signing digest',
    )
  })

  it.each([
    ['malformed hex', '0xnot-a-private-key'],
    ['odd-length hex', '0xabc'],
    ['short key', new Uint8Array(31)],
    ['zero scalar', new Uint8Array(32)],
    ['out-of-range scalar', new Uint8Array(32).fill(255)],
  ])('rejects %s without exposing the private key', (_, invalidKey) => {
    let error
    try {
      signDigest(invalidKey, new Uint8Array(32))
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Invalid secp256k1 private key')
    expect(error).not.toHaveProperty('value')
    expect(error).not.toHaveProperty('cause')
    expect(JSON.stringify(error)).toBe('{}')
  })
})
