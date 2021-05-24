import {cat, zeroOrOne, epochRef, base32Address} from '@cfxjs/spec'

export const NAME = 'cfx_getAccount'

export const schemas = {
  input: [cat, base32Address, [zeroOrOne, epochRef]],
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const main = async ({f, params}) => {
  // TODO: validate address with target network id
  return await f({params})
}
