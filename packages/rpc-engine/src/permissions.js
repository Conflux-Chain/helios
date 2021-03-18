/**
 * @fileOverview fns to deal with rpc permissions
 * @name permissions.js
 */
import {mergeDeepObj} from '@cfxjs/associative'

export const defaultPermissions = {
  methods: [],
  store: {write: false, read: false},
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

export const getWalletStore = (rpcStore, walletStore, methodName) => {
  const {getState, setState} = walletStore

  const protectedStore = {}
  if (rpcStore[methodName].permissions.store.read)
    protectedStore.getState = getState
  if (rpcStore[methodName].permissions.store.write)
    protectedStore.setState = setState

  return protectedStore
}
