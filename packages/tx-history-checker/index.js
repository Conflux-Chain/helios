/**
 * @fileOverview tx history checker
 * @name index.js
 */

import {validateBase32Address} from '@fluent-wallet/base32-address'
import {CFX_MAINNET_NETID} from '@fluent-wallet/consts'

export default async function txHistoryChecker({
  address = '',
  type = 'cfx',
  chainId = CFX_MAINNET_NETID,
}) {
  try {
    if (!address) throw new Error('not params address')
    if (!type) throw new Error('not params type')
    if (chainId === undefined || chainId === null)
      throw new Error('not params chainId')

    if (type === 'cfx') {
      if (validateBase32Address(address, chainId)) {
        return window
          .fetch(
            `https://${
              chainId === CFX_MAINNET_NETID ? 'api' : 'api-testnet'
            }.confluxscan.org/account/transactions?account=${address}&limit=0`,
          )
          .then(response => response.json())
          .then(data => {
            if (data?.code === 0) {
              const hasTxHistory = data?.data?.total !== 0
              return hasTxHistory
            } else {
              throw new Error(data.message)
            }
          })
          .catch(e => {
            throw new Error(e)
          })
      } else {
        throw new Error(`${address} is not a valid cfx base32 address`)
      }
    } else {
      throw new Error(`not support ${type} chain yet`)
    }
  } catch (e) {
    throw new Error(e)
  }
}
