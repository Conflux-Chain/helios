import {epochTag, zeroOrOne, or, nul} from '@cfxjs/spec'

export const NAME = 'cfx_epochNumber'

export const schemas = {
  input: [or, [zeroOrOne, epochTag], nul],
}

export const cache = {
  type: 'ttl',
  ttl: 500,
  key: ({params}) => `${NAME}${params[0]}`,
}

export const main = async ({f, params}) => {
  if (!params || !params[0]) params = ['latest_state']
  return await f({params})
}
