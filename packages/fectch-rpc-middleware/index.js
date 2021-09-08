import {defMiddleware} from '@fluent-wallet/rpc-engine/middleware.js'
import {stream} from '@thi.ng/rstream'
import {initFetcher} from '@fluent-wallet/fetch-rpc'

const fetcher = initFetcher()

const s = stream({
  id: 'rpc-fetcher-stream',
  closeIn: false,
  closeOut: false,
  cache: false,
})

function defRpcFetcher(req) {
  const {params, method, id} = req

  return (newReq = {}) => {
    return fetcher.post('https://portal-main.confluxrpc.com', {
      json: {jsonrpc: '2.0', id, params, method, ...newReq},
    })
  }
}

export default defMiddleware(({tx: {map}}) => [
  {
    id: 'fetchRpc',
    ins: {
      req: {stream: () => s},
    },
    fn: map(({req, rpcStore}) => ({
      ...req,
      f: defRpcFetcher(req, rpcStore),
    })),
  },
])
