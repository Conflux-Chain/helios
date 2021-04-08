/**
 * @fileOverview error handler used in rpc engine
 * @name error.js
 */
import {IS_DEV_MODE} from 'utils'

export const appendRpcStackToErrorMessage = (err, stack) => {
  const reversedStack = stack.slice().reverse()
  const stackMessage = `\nRPC Stack:\n-> ${reversedStack.join('\n-> ')}\n`
  err.message += stackMessage
  return err
}

export const rpcErrorHandler = (err, _, req) => {
  if (!err || !err.message) throw new Error('Invalid error')
  err = appendRpcStackToErrorMessage(err, req._rpcStack || [req.method])

  /* istanbul ignore if  */
  if (IS_DEV_MODE) console.error(err)
  req._c.write({
    jsonrpc: '2.0',
    error: {code: -32603, message: err.message, data: err},
    id: req.id === undefined ? 2 : req.id,
  })
}
