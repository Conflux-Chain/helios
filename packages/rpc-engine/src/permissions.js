/**
 * @fileOverview fns to deal with rpc permissions
 * @name permissions.js
 */
import {mergeDeepObj} from '@cfxjs/associative'

export const defaultPermissions = {
  methods: [],
}

export const format = (rpcPermissions = {}) =>
  mergeDeepObj(defaultPermissions, rpcPermissions)

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
