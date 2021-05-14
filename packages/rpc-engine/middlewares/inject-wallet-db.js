import {defMiddleware} from '../middleware.js'

export default defMiddleware(({tx: {map}, perms: {getWalletDB}}) => ({
  id: 'injectWalletDB',
  ins: {
    req: {stream: '/injectRpcStore/node'},
  },
  fn: map(({req, rpcStore, db}) => ({
    ...req,
    db: getWalletDB(rpcStore, db, req.method),
  })),
}))
