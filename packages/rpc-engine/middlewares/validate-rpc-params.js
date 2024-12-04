import {defMiddleware} from '../middleware.js'
import {validate, explain} from '@fluent-wallet/spec'
import {isString, isArray} from '@fluent-wallet/checks'

const toLowerCaseFields = [
  'gas',
  'gasLimit',
  'gasPrice',
  'maxFeePerGas',
  'maxPriorityFeePerGas',
  'data',
  'nonce',
  'type',
]

function preprocessTx(tx) {
  toLowerCaseFields.forEach(k => {
    if (isString(tx[k])) tx[k] = tx[k].toLowerCase()
  })
  // 1559
  if (tx.maxFeePerGas) tx.type = '0x2'
  // 2930
  if (!tx.maxFeePerGas && tx.accessList) tx.type = '0x1'
  return tx
}

export default defMiddleware(({tx: {map, comp}}) => ({
  id: 'validateRpcParams',
  ins: {
    req: {stream: '/injectFetchFn/node'},
  },
  fn: comp(
    map(({rpcStore, req}) => {
      const {params, method} = req
      const {schemas, Err} = rpcStore[method]
      // TODO: add a preprocess middleware to transform req params for more compatibilities
      if (
        (method === 'eth_sendTransaction' ||
          method === 'cfx_sendTransaction') &&
        isArray(params)
      ) {
        params[0] = preprocessTx(params[0])
      }
      if (schemas.input) {
        if (!validate(schemas.input, params, {netId: req.network.netId})) {
          throw Err.InvalidParams(
            `input params:\n${JSON.stringify(
              params,
              null,
              '\t',
            )}\n\nError:\n${JSON.stringify(
              explain(schemas.input, params, {netId: req.network.netId}),
              null,
              '\t',
            )}`,
            req,
          )
        }
      }

      return req
    }),
  ),
}))
