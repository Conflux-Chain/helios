import {map, mapp} from '@cfxjs/spec'

export const NAME = 'wallet_validateAppPermissions'

export const schemas = {
  input: [map, {closed: true}, ['permissions', mapp]],
}

export const permissions = {
  locked: true,
  external: [],
}

export const main = ({params: perms, app}) => {
  if (!app) false
  // TODO: validte more detailed permissions once we need more detailed permissions other than {cfx_accounts:{}}
  return Object.keys(perms).reduce((acc, p) => acc || app.perms?.[p], false)
}
