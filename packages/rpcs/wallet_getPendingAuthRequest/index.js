import {nul, or, and, empty, arrp} from '@cfxjs/spec'

export const NAME = 'wallet_getPendingAuthRequest'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getAuthReq'],
}

export const main = ({db: {getAuthReq}}) => {
  return getAuthReq()
}
