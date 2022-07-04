/**
 * @fileOverview fns to deal with rpc permissions
 * @name permissions.js
 */
import {mergeDeepObj} from '@fluent-wallet/associative'
import {threadLast} from '@fluent-wallet/compose'

export const defaultPermissions = {
  methods: [],
  locked: false,
  db: [],
  external: [],
  scope: {wallet_basic: {}},
}

// NOTE:
//
// RPC METHODS WITH
// 1. external.includes('inpage') && locked can be called directly from inpage
//    in locked/unlocked state, eg. cfx_call, eth_blockNumber
//
// 2. external.includes('inpage') && !locked will bring up unlock UI when called
//    from inpage in locked state
//
// 3. external.includes('inpage') && scope only allowed to be called by
//    connected dapp
//
// 4. unset scope will get the default scope in defaultPermissions
//
// 5. external === _empty_array_ can only be called by other rpc methods
//
function injectUIMethods(rpcPermissions) {
  if (
    // allowed to be called from inpage
    rpcPermissions.external.includes('inpage') &&
    // only allowed to be called in unlock state
    !rpcPermissions.locked &&
    !rpcPermissions.methods.includes('wallet_requestUnlockUI')
  ) {
    rpcPermissions.methods.push('wallet_requestUnlockUI')
    if (rpcPermissions.scope) {
      rpcPermissions.methods.push('wallet_validateAppPermissions')
    }
  }
  return rpcPermissions
}

export const format = (rpcPermissions = {}) =>
  threadLast(
    rpcPermissions,
    [mergeDeepObj, defaultPermissions],
    [injectUIMethods],
  )

export const getRpc = (rpcStore, callerMethodName, callingMethodName) => {
  const {permissions} = rpcStore[callerMethodName]

  return (
    permissions.methods.includes(callingMethodName) &&
    rpcStore[callingMethodName]
  )
}

export const getWalletDB = (rpcStore, db, methodName) => {
  return new Proxy(
    {},
    {
      get() {
        const targetMethodName = arguments[1]
        if (!rpcStore[methodName].permissions?.db?.includes?.(targetMethodName))
          throw new Error(
            `No permission to call db method ${targetMethodName} in ${methodName}`,
          )

        return db[targetMethodName]
      },
    },
  )
}
