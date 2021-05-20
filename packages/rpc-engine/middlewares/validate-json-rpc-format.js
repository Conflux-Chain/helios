import {defMiddleware} from '../middleware.js'
import {utils as rpcUtils} from '@cfxjs/json-rpc'
import rndId from '@cfxjs/random-id'

function simpleFormat(req) {
  req.jsonrpc = req.jsonrpc || '2.0'
  req.id = req.id ?? rndId()
  return req
}

function validate(InvalidRequest, req) {
  if (!rpcUtils.isValidRequest(req))
    throw new InvalidRequest(
      'invalid rpc request:\n' +
        JSON.stringify({params: req.params, method: req.method}, null, '\t') +
        '\n',
    )
}

export default defMiddleware(
  ({tx: {comp, map, pluck, check}, comp: {partial}, err: {InvalidRequest}}) => {
    return {
      id: 'validateAndFormatJsonRpc',
      ins: {req: {stream: '/START/node'}},
      fn: comp(
        pluck('req'),
        map(simpleFormat),
        check(partial(validate, InvalidRequest)),
      ),
    }
  },
)
