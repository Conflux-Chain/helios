/**
 * @fileOverview error handler used in rpc engine
 * @name error.js
 */
import {errorInstanceToErrorCode} from '@fluent-wallet/json-rpc-error'

export const appendRpcStackToErrorMessage = (err, stack) => {
  if (err?.message?.includes?.('RPC Stack:')) return err
  const reversedStack = stack.slice().reverse()
  const stackMessage = `\nRPC Stack:\n-> ${reversedStack.join('\n-> ')}\n`
  err.message += stackMessage
  return err
}

export const rpcErrorHandlerFactory = ({isProd = true, debugLog} = {}) => {
  return err => {
    if (!err || !err.message || !err.rpcData || !err.rpcData._c) {
      if (!isProd) {
        console.error(
          'DEV_ONLY_ERROR in method: ',
          debugLog.reduce((acc, {method}) => acc || method, null) ||
            'unknown method',
          '\nin middleware: ',
          debugLog[0]?.mid,
          '\ninvalid error, missing [message] or [rpcData]\n',
          err,
          '\nall debug log:\n',
          debugLog,
        )
      }
      return true
    }
    const req = err.rpcData
    err = appendRpcStackToErrorMessage(err, req._rpcStack || [req.method])

    /* istanbul ignore if  */
    if (!isProd && !err?.message?.includes('UserRejected')) {
      console.error('DEV_ONLY_ERROR:', err.stack || '')
    }

    req._c.write({
      jsonrpc: '2.0',
      error: {
        code: errorInstanceToErrorCode(err),
        message: err.message,
        data: err.extra || err.data,
      },
      id: req.id === undefined ? 2 : req.id,
    })

    // indicating error get handdled
    return true
  }
}
