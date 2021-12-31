export const NAME = 'wallet_lock'

export const schemas = {}

export const permissions = {
  db: ['setLocked', 'findApp'],
  external: ['popup'],
}

export const main = async ({db: {setLocked, findApp}}) => {
  setLocked(true)
  const apps = findApp({g: {site: {post: 1}}})
  apps.forEach(app => {
    try {
      if (!app?.site?.post) return
      const {
        site: {post},
      } = app
      post({event: 'accountsChanged', params: []})
      // eslint-disable-next-line no-empty
    } catch (err) {}
  })
}
