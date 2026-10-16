import {inflateRawSync} from 'node:zlib'
import {describe, expect, it} from 'vitest'
import {encodeCalldataForUrl} from './calldataUrl'
// Shared Scan protocol vectors; keep this fixture identical to
// Conflux-Chain/sirius-next/packages/common/src/utils/test/fixtures/calldataUrlEncoding.json.
// Exact outputs check interoperability; node:zlib independently checks decoding.
import vectors from './test/fixtures/calldataUrlEncoding.json'

const inputFor = ({input, generation}) => {
  if (input !== undefined) return input
  if (generation.pattern === 'sequential-byte-cycle') {
    return `0x${Buffer.from(
      Array.from({length: generation.byteLength}, (_, index) => index % 256),
    ).toString('hex')}`
  }
  return `0x${generation.byteHex.repeat(generation.repeat)}`
}

const decode = encoded => {
  if (encoded.startsWith('0x')) return encoded
  const bytes = Buffer.from(encoded.slice(3), 'base64url')
  return `0x${(encoded.startsWith('d1.')
    ? inflateRawSync(bytes)
    : bytes
  ).toString('hex')}`
}

describe('encodeCalldataForUrl Scan protocol', () => {
  it.each([
    ...vectors.exactEncodingVectors,
    ...vectors.base64ReferenceVectors,
    ...vectors.deflateReferenceVectors,
  ])('matches the reference encoding: $id', vector => {
    const input = inputFor(vector)
    const encoded = encodeCalldataForUrl(input)
    expect(encoded).toBe(vector.expectedOutput ?? vector.pakoReferenceOutput)
    expect(decode(encoded)).toBe(input.toLowerCase())
  })

  it.each(vectors.invalidInputVectors)('rejects invalid input: $id', vector => {
    expect(() => encodeCalldataForUrl(vector.input)).toThrow(TypeError)
  })

  it.each(vectors.generatedBoundaryVectors)(
    'enforces the boundary: $id',
    vector => {
      const input = inputFor(vector)
      if (vector.expectedError) {
        expect(() => encodeCalldataForUrl(input)).toThrow(RangeError)
      } else {
        const encoded = encodeCalldataForUrl(input)
        expect(
          encoded.startsWith(vector.expectedCodec === 'hex' ? '0x' : 'd1.'),
        ).toBe(true)
        expect(decode(encoded)).toBe(input)
      }
    },
  )

  it('normalizes omitted and blank data, but rejects other non-string inputs', () => {
    expect(encodeCalldataForUrl()).toBe('0x')
    expect(encodeCalldataForUrl('')).toBe('0x')
    for (const input of [null, 0, {}, ['0x12']]) {
      expect(() => encodeCalldataForUrl(input)).toThrow(TypeError)
    }
  })
})
