import {nul, or, and, empty, arrp} from '@cfxjs/spec'

export const NAME = 'wallet_getCurrentNetwork'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getOneNetwork'],
}

export const main = ({db: {getOneNetwork}}) => {
  return getOneNetwork({selected: true})
}
