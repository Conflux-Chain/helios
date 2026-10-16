// Access-list validation follows sirius-next transactionLists.ts.
const isObject = value =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isAddress = value =>
  typeof value === 'string' && /^0x[\da-fA-F]{40}$/.test(value)

export function validateAndCopyAccessList(accessList) {
  if (!Array.isArray(accessList)) {
    throw new TypeError('accessList: must be an array')
  }
  // Preserve entry/key order and duplicates when copying the transaction.
  // Duplicate addresses and storage keys are charged intrinsic gas too.
  return accessList.map(entry => {
    if (
      !isObject(entry) ||
      !isAddress(entry.address) ||
      !Array.isArray(entry.storageKeys) ||
      !entry.storageKeys.every(
        key => typeof key === 'string' && /^0x[\da-fA-F]{64}$/.test(key),
      )
    ) {
      throw new TypeError(
        'accessList: each entry requires an address and 32-byte storage keys',
      )
    }
    return {address: entry.address, storageKeys: [...entry.storageKeys]}
  })
}
