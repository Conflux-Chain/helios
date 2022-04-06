import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_getPermissions'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['inpage'],
}

export const main = ({Err: {InvalidRequest}, app}) => {
  if (!app) throw InvalidRequest()
  const permissions = Object.keys(app.perms).reduce((acc, p) => {
    const perm = [
      {
        invoker: app.site.origin,
        parentCapability: p,
        date: app.permUpdatedAt,
      },
    ]
    if (p.startsWith('wallet_')) {
      perm.push({
        invoker: app.site.origin,
        parentCapability: p.replace('wallet_', 'cfx_'),
        date: app.permUpdatedAt,
      })
      perm.push({
        invoker: app.site.origin,
        parentCapability: p.replace('wallet_', 'eth_'),
        date: app.permUpdatedAt,
      })
    }
    return acc.concat(perm)
  }, [])

  return permissions
}
