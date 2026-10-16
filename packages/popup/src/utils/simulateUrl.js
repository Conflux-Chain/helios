import {encodeCalldataForUrl} from './calldataUrl'
import {
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
} from '@fluent-wallet/consts'
import {validateAndCopyAccessList} from './accessList'

const MAX_ACCESS_LIST_JSON_LENGTH = 128 * 1024

export function canSimulateTransaction({
  transaction,
  network,
  enabled,
  sponsorshipLoading = false,
  sponsored = false,
}) {
  return Boolean(
    // Wait until transaction data is available.
    transaction &&
      // Authorization-list transactions are unsupported, including empty lists.
      transaction.authorizationList === undefined &&
      // Require the user to explicitly enable simulation in advanced settings.
      enabled === true &&
      // Exclude Core Space and other non-EVM network types.
      network?.type === 'eth' &&
      // Only Conflux eSpace mainnet and testnet support Scan simulation.
      [CFX_ESPACE_MAINNET_CHAINID, CFX_ESPACE_TESTNET_CHAINID].includes(
        network.chainId,
      ) &&
      // Keep the button hidden while gas sponsorship eligibility is being checked.
      !sponsorshipLoading &&
      // Sponsored submissions cannot be simulated through this transaction URL.
      !sponsored,
  )
}

export function getSimulateUrl(scanUrl, transaction) {
  if (transaction.authorizationList !== undefined) {
    throw new TypeError(
      'Simulation does not support authorizationList transactions.',
    )
  }
  const url = new URL('/simulate-trace', scanUrl)
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new TypeError('Invalid Scan URL.')
  }

  url.searchParams.set('data', encodeCalldataForUrl(transaction.data))
  // Only forward fields consumed by Scan, preserving integer precision and units.
  for (const key of [
    'from',
    'to',
    'value',
    'gas',
    'gasPrice',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ]) {
    const value = transaction[key]
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }
  if (transaction.accessList !== undefined) {
    const value = JSON.stringify(
      validateAndCopyAccessList(transaction.accessList),
    )
    if (value.length > MAX_ACCESS_LIST_JSON_LENGTH) {
      throw new RangeError('accessList: exceeds the 128 Ki character URL limit')
    }
    url.searchParams.set('accessList', value)
  }
  return url.toString()
}
