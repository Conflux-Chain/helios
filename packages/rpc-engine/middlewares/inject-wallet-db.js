import {defMiddleware} from '../middleware.js'

export default defMiddleware(({tx: {map, comp}, perms: {getWalletDB}}) => ({
  id: 'injectWalletDB',
  ins: {
    req: {stream: '/injectRpcStore/node'},
  },
  fn: comp(
    map(({req, rpcStore, db}) => {
      return {
        ...req,
        db:
          req.method === 'wallet_dbQuery'
            ? db
            : getWalletDB(rpcStore, db, req.method),
      }
    }),
  ),
}))
