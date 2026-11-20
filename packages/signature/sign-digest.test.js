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

  it('rejects non-32-byte inputs rather than signing a different value', () => {
    expect(() => signDigest(privateKey, new Uint8Array(31))).toThrow()
    expect(() => signDigest('0x01', new Uint8Array(32))).toThrow()
  })
})
