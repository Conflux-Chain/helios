import {nul, or, and, empty, arrp} from '@cfxjs/spec'

export const NAME = 'wallet_getPermissions'

export const schemas = {
  input: [or, nul, [and, arrp, empty]],
}

export const permissions = {
  external: ['inpage'],
}

export const main = ({Err: {InvalidRequest}, app}) => {
  if (!app) throw InvalidRequest()
  const permissions = Object.keys(app.perms).reduce(
    (acc, p) => [
      ...acc,
      {
        invoker: app.site.origin,
        parentCapability: p,
        date: app.permUpdatedAt,
      },
    ],
    [],
  )

  return permissions
}
