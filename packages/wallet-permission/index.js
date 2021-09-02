import perms from './permissions.js'
import docs from './docs.js'

export const generateSchema = spec => {
  const {mapp, map, and, empty} = spec
  return [
    map,
    ...Object.keys(perms).map(permissionName => [
      permissionName,
      {
        optional: true,
        doc:
          // TODO: i18n
          docs[permissionName]?.en || `${permissionName} wallet permission`,
      },
      // TODO: remove empty if there's more cap in permissions
      [and, mapp, empty],
    ]),
  ]
}

export default perms
