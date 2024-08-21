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
  ({tx: {map, pluck, sideEffect, comp}, stream: {resolve}}) => [
    {
      id: 'beforeCallRpc',
      ins: {
        req: {stream: '/validateRpcParams/node'},
      },
      fn: comp(
        map(async ({rpcStore, req, db}) => {
          const method = rpcStore[req.method]
          // validate dapp permissions to call this rpc
          if (
            req._inpage &&
            !req._internal &&
            method.permissions.scope &&
            !method.permissions.locked
          ) {
            const isValid = await req.rpcs
              .wallet_validateAppPermissions({
                permissions: rpcStore[req.method].permissions.scope,
              })
              .catch(err => {
                err.rpcData = req
                throw err
              })
            if (!isValid) {
              const err = req.Err.Unauthorized()
              err.rpcData = req
              throw err
            }
          }

          // guard inpage methods when wallet locked
          if (
            // called from inpage
            req._inpage &&
            // allowed to be called in locked state
            !rpcStore[req.method].permissions.locked &&
            // wallet is locked
            db.getLocked() &&
            // allowed to be called from inpage
            rpcStore[req.method].permissions.external.includes('inpage')
          ) {
            if (
              // allowed to bring up unlock UI
              // this is determined by function injectUIMethods at ../src/permissions.js
              rpcStore[req.method].permissions.methods.includes(
                'wallet_requestUnlockUI',
              )
            ) {
              // allow some inpage rpc methods to request the unlock ui
              await req.rpcs.wallet_requestUnlockUI().catch(err => {
                err.rpcData = req
                throw err
              })
            } else {
              // reject others
              const err = req.Err.Unauthorized()
              err.rpcData = req
              throw err
            }
          }
          return req
        }),
      ),
    },
    {
      id: 'callRpc',
      ins: {
        req: {
          stream: r => r('/beforeCallRpc/node').subscribe(resolve()),
        },
      },
      fn: comp(
        map(async ({rpcStore, req}) => ({
          req,
          res: await rpcStore[req.method].main(req).catch(err => {
            err.rpcData = req
            throw err
          }),
        })),
      ),
    },
    {
      id: 'afterCallRpc',
      ins: {
        ctx: {stream: r => r('/callRpc/node').subscribe(resolve())},
      },
      fn: comp(
        map(({ctx: {req, res}}) => ({
          req,
          res: formatRes(res, req.id),
        })),
      ),
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
      fn: comp(sideEffect(({res, req: {_c}}) => _c.write(res))),
    },
  ],
)
