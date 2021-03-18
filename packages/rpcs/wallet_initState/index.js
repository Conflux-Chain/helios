/**
 * @fileOverview rpc defination of wallet_initState
 * @name index.js
 */
import s from '@cfxjs/spec'

export const NAME = 'wallet_initState'

export const permissions = {
  methods: [],
  store: {write: true},
}

export const schemas = {
  input: [
    s.map,
    s.closed,
    ['oldState', s.optional, s.mapp],
    ['initState', s.optional, s.mapp],
  ],
}

export function documentation() {
  return {
    doc: 'Method to initialize the state of wallet',
  }
}

export async function main({params = {}, setWalletState}) {
  const {oldState = {}, initState = {}} = params
  setWalletState({...initState, ...oldState})
}
