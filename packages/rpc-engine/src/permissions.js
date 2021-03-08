/**
 * @fileOverview fns to deal with rpc permissions
 * @name permissions.js
 */
import mergeDeepLeft from 'ramda/es/mergeDeepLeft'

export const defaultPermissions = {
  methods: [],
  store: {set: false, get: false},
}

export const format = (rpcPermissions = {}) =>
  mergeDeepLeft(rpcPermissions, defaultPermissions)

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
  if (rpcStore[methodName].permissions.store.get)
    protectedStore.getState = getState
  if (rpcStore[methodName].permissions.store.set)
    protectedStore.setState = setState

  return protectedStore
}
