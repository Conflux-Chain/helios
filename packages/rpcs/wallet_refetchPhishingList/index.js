import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_refetchPhishingList'
export const schemas = {input: optParam}
export const permissions = {external: [], db: ['getLocked']}

export async function main({db: {getLocked}}) {
  // Docs import RPC metadata outside the extension. Load browser storage only
  // when dispatched, and do not make the unlock path wait for a network check.
  const {refreshIfDue} = await import(/* webpackMode: "eager" */ './client.js')
  void refreshIfDue(getLocked)
}
