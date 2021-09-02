/**
 * @fileOverview fns to deal with rpc permissions
 * @name permissions.js
 */
import {mergeDeepObj} from '@cfxjs/associative'
import {threadLast} from '@cfxjs/compose'

export const defaultPermissions = {
  methods: [],
  locked: false,
  db: [],
  external: [],
  scope: {wallet_basic: {}},
}

function injectUIMethods(rpcPermissions) {
  if (
    rpcPermissions.external.includes('inpage') &&
    !rpcPermissions.locked &&
    !rpcPermissions.methods.includes('wallet_requestUnlockUI')
  ) {
    rpcPermissions.methods.push('wallet_requestUnlockUI')
    if (rpcPermissions.scope)
      rpcPermissions.methods.push('wallet_validateAppPermissions')
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
