export const EIP5792_VERSION = '2.0.0'
export const MAX_BUNDLE_ID_BYTES = 4096

const textEncoder = new TextEncoder()

export function isBundleIdWithinByteLimit(bundleId) {
  return textEncoder.encode(bundleId).byteLength <= MAX_BUNDLE_ID_BYTES
}
