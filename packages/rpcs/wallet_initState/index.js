/**
 * @fileOverview rpc defination of wallet_initState
 * @name index.js
 */
import {map, mapp} from '@cfxjs/spec'

export const NAME = 'wallet_initState'

export const permissions = {
  methods: [],
  store: {write: true},
}

export const schemas = {
  input: [
    map,
    {closed: true},
    ['oldState', {optional: true}, mapp],
    ['initState', {optional: true}, mapp],
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
