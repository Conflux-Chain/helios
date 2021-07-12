import {nul, or, and, empty, arrp} from '@cfxjs/spec'

export const NAME = 'cfx_netVersion'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_getStatus'],
}

export const cache = {
  type: 'ttl',
  ttl: 24 * 60 * 60 * 1000,
  key: () => NAME,
  afterGet(_, c) {
    if (!c) return 'nocache'
  },
}

export const main = async ({f, rpcs: {cfx_getStatus}}) => {
  const rst = await f()
  if (rst?.result === 'nocache')
    return parseInt((await cfx_getStatus())?.networkId, 16).toString()
  else return parseInt(rst.result, 16).toString()
}
