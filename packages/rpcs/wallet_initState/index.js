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

export const validator = {
  input() {
    return {
      // used to check the input/output, generate documentation, generate fake data
      // TODO: add the functionality of validating input/output with schema
      // eg: a function validate(schema, input) returns a structured error
      // TODO: add the functionality to generate fake data with schema
      // eg: a function `generateFakeData(schema)`
      // TODO: add the functionality to generate input/output documentation with schema
      // eg: a function `generateDocumentation(schema)`
      schema: isObject,
      // optional, used to generate fake data directly
      generate: () => new Object(),
    }
  },
}

export async function main({params = {}, setWalletState}) {
  const {oldState = {}, initState = {}} = params
  setWalletState({...initState, ...oldState})
}
