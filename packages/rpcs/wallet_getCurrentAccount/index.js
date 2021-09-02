import {nul, or, and, empty, arrp} from '@cfxjs/spec'

export const NAME = 'wallet_getCurrentAccount'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['getOneAccount'],
}

export const main = ({db: {getOneAccount}}) => {
  return getOneAccount({selected: true})
}
