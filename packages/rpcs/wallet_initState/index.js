/**
 * @fileOverview rpc defination of wallet_initState
 * @name index.js
 */
export const NAME = 'wallet_initState'

export const permissions = {
  methods: [],
  store: {set: true, get: true},
}

export async function main({params = {}, setWalletState}) {
  const {oldState = {}, initState = {}} = params
  setWalletState({...initState, ...oldState})
}
