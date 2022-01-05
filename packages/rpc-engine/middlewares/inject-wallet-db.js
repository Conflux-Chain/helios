import {defMiddleware} from '../middleware.js'
import {addBreadcrumb} from '@fluent-wallet/sentry'

export default defMiddleware(
  ({tx: {map, comp, sideEffect}, perms: {getWalletDB}}) => ({
    id: 'injectWalletDB',
    ins: {
      req: {stream: '/injectRpcStore/node'},
    },
    fn: comp(
      sideEffect(() => addBreadcrumb({category: 'middleware-injectWalletDB'})),
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
  }),
)
