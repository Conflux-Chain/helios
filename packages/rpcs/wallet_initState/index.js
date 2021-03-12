/**
 * @fileOverview rpc defination of wallet_initState
 * @name index.js
 */
import {isObject} from '@cfxjs/checks'

export const NAME = 'wallet_initState'

export const permissions = {
  methods: [],
  store: {set: true},
}

export function generateParams() {
  return {}
}

export function documentation() {
  return {
    doc: 'Method to initialize the state of wallet',
  }
}

export function before({params, Err}) {
  if (!isObject(params)) throw Err('Invalid params')
}

export async function main({params = {}, setWalletState}) {
  const {oldState = {}, initState = {}} = params
  setWalletState({...initState, ...oldState})
}
