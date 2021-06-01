/**
 * @fileOverview error handler used in rpc engine
 * @name error.js
 */
import {errorInstanceToErrorCode} from '@cfxjs/json-rpc-error'

export const appendRpcStackToErrorMessage = (err, stack) => {
  const reversedStack = stack.slice().reverse()
  const stackMessage = `\nRPC Stack:\n-> ${reversedStack.join('\n-> ')}\n`
  err.message += stackMessage
  return err
}

export const rpcErrorHandlerFactory = (isProd = true) => {
  return function (err) {
    if (!err || !err.message || !err.rpcData) {
      if (!isProd)
        console.error('invalid error, missing [message] or [rpcData]\n', err)
      throw new Error('Invalid error')
    }
    const req = err.rpcData
    err = appendRpcStackToErrorMessage(err, req._rpcStack || [req.method])

    /* istanbul ignore if  */
    if (isProd) console.error(err.message, '\n', err.stack)
    req._c.write({
      jsonrpc: '2.0',
      error: {
        code: errorInstanceToErrorCode(err) || -32000,
        message: err.message,
        data: err,
      },
      id: req.id === undefined ? 2 : req.id,
    })

    // indicating error get handdled
    return true
  }
}
