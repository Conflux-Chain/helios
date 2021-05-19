import {cat, zeroOrOne, epochTag, base32AccountAddress} from '@cfxjs/spec'

export const NAME = 'cfx_getAccount'

export const schemas = {
  input: [cat, base32AccountAddress, [zeroOrOne, epochTag]],
}

export const main = async ({f, params}) => {
  // TODO: validate address with target network id
  return await f({params})
}
