import {validatePrivateKey} from '@fluent-wallet/account'
import {map, stringp} from '@fluent-wallet/spec'

export const NAME = 'wallet_validatePrivateKey'

export const schemas = {
  input: [map, {closed: true}, ['privateKey', [stringp, {min: 1}]]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({params: {privateKey}}) => {
  return {valid: validatePrivateKey(privateKey)}
}
