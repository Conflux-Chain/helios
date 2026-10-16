import {deflateRaw} from 'pako'

const MAX_CALLDATA_BYTES = 1024 * 1024
const PASSTHROUGH_MAX_BYTES = 256

const bytesToBase64Url = bytes => {
  let binary = ''
  // Chunk the spread to stay below the engine's function argument limit.
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

// Protocol: sirius-next/packages/common/docs/encode-calldata-for-url-implementation.md
export function encodeCalldataForUrl(data = '0x') {
  const calldata = data === '' ? '0x' : data
  if (
    typeof calldata !== 'string' ||
    !/^0x(?:[0-9a-fA-F]{2})*$/.test(calldata)
  ) {
    throw new TypeError(
      'Calldata must be an even-length 0x-prefixed hex value.',
    )
  }
  const byteLength = (calldata.length - 2) / 2
  if (byteLength > MAX_CALLDATA_BYTES) {
    throw new RangeError('Calldata exceeds the 1 MiB limit.')
  }

  const hex = calldata.toLowerCase()
  // The Scan protocol keeps <=256 bytes as hex, even if compression is shorter.
  if (byteLength <= PASSTHROUGH_MAX_BYTES) return hex

  const bytes = new Uint8Array(byteLength)
  for (let index = 0; index < byteLength; index += 1) {
    bytes[index] = Number.parseInt(
      calldata.slice(index * 2 + 2, index * 2 + 4),
      16,
    )
  }
  // Above 256 bytes, Base64URL is always shorter than hex (including prefixes).
  // b1 is Base64URL; d1 is raw DEFLATE followed by Base64URL (no zlib/gzip header).
  const base64 = `b1.${bytesToBase64Url(bytes)}`
  const deflate = `d1.${bytesToBase64Url(deflateRaw(bytes, {level: 9}))}`
  return deflate.length < base64.length ? deflate : base64
}
