import {defMiddleware} from '../middleware.js'

function formatRes(res, id) {
  const template = {id, jsonrpc: '2.0'}
  if (res !== undefined) {
    // already valid res (from fullnode)
    if (res?.jsonrpc && Object.prototype.hasOwnProperty.call(res, 'id'))
      return res
    // only the res result
    return {...template, result: res}
  }

  // undefined res
  return {...template, result: '0x1'}
}

export default defMiddleware(
  ({tx: {map, pluck, sideEffect}, stream: {resolve}}) => [
    {
      id: 'beforeCallRpc',
      ins: {
        req: {stream: '/validateRpcParams/node'},
      },
      fn: map(async ({rpcStore, req, db}) => {
        if (req._inpage && rpcStore[req.method].permissions.scope) {
          const isValid = await req.rpcs
            .wallet_validateAppPermissions({
              permissions: rpcStore[req.method].permissions.scope,
            })
            .catch(err => {
              err.rpcData = req
              throw err
            })
          if (!isValid) throw req.Err.Unauthorized()
        }

        // some inpage rpc methods needs the wallet in unlocked state
        if (
          !rpcStore[req.method].permissions.locked &&
          rpcStore[req.method].permissions.external.includes('inpage') &&
          db.getLocked()
        ) {
          await req.rpcs.wallet_requestUnlockUI().catch(err => {
            err.rpcData = req
            throw err
          })
        }
        return req
      }),
    },
    {
      id: 'callRpc',
      ins: {
        req: {stream: r => r('/beforeCallRpc/node').subscribe(resolve())},
      },
      fn: map(async ({rpcStore, req}) => ({
        req,
        res: await rpcStore[req.method].main(req).catch(err => {
          err.rpcData = req
          throw err
        }),
      })),
    },
    {
      id: 'afterCallRpc',
      ins: {
        ctx: {stream: r => r('/callRpc/node').subscribe(resolve())},
      },
      fn: map(({ctx: {req, res}}) => ({
        req,
        res: formatRes(res, req.id),
      })),
      outs: {
        req: n => n.subscribe({}, {xform: pluck('req')}),
        res: n => n.subscribe({}, {xform: pluck('res')}),
      },
    },
    {
      id: 'END',
      ins: {
        res: {stream: '/afterCallRpc/outs/res'},
        req: {stream: '/afterCallRpc/outs/req'},
      },
      fn: sideEffect(({res, req: {_c}}) => _c.write(res)),
    },
  ],
)
