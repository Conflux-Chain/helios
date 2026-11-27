import {optParam} from '@fluent-wallet/spec'
import {refreshIfDue} from './service.js'

export const NAME = 'wallet_refetchPhishingList'
export const schemas = {input: optParam}
export const permissions = {external: [], db: ['getLocked']}

export async function main({db: {getLocked}}) {
  // Unlock does not wait for a remote list check.
  void refreshIfDue(getLocked)
}
