import {defRpcError} from '@cfxjs/errors'

export const errorStackPop = error => {
  if (error?.stack) {
    const stack = error.stack.split('\n')
    error.stack = stack.reduce(
      ([s, poped], line) => {
        if (!poped && /^\s*at\s.*\..*:\d+\)?$/.test(line)) return [s, true]
        if (/@thi\.ng/.test(line)) return [s, poped]
        return [s + '\n' + line]
      },
      [''],
    )[0]
  }
}

export const ERROR = {
  PARSE: {code: -32700, name: 'ParseError'},
  INVALID_REQUEST: {code: -32600, name: 'InvalidRequest'},
  METHOD_NOT_FOUND: {code: -32601, name: 'MethodNotFound'},
  INVALID_PARAMS: {code: -32602, name: 'InvalidParams'},
  INTERNAL: {code: -32603, name: 'InternalError'},
  SERVER: {code: -32000, name: 'ServerError'},
}

export const Parse = defRpcError(
  () => `JSON-RPC ${ERROR.PARSE.name} ${ERROR.PARSE.code}\n\n`,
  msg => msg,
)

export const InvalidRequest = defRpcError(
  () =>
    `JSON-RPC ${ERROR.INVALID_REQUEST.name} ${ERROR.INVALID_REQUEST.code}\n\n`,
  msg => msg,
)

export const MethodNotFound = defRpcError(
  () =>
    `JSON-RPC ${ERROR.METHOD_NOT_FOUND.name} ${ERROR.METHOD_NOT_FOUND.code}\n\n`,
  msg => msg,
)

export const InvalidParams = defRpcError(
  () =>
    `JSON-RPC ${ERROR.INVALID_PARAMS.name} ${ERROR.INVALID_PARAMS.code}\n\n`,
  msg => msg,
)

export const Internal = defRpcError(
  () => `JSON-RPC ${ERROR.INTERNAL.name} ${ERROR.INTERNAL.code}\n\n`,
  msg => msg,
)

export const Server = defRpcError(
  () => `JSON-RPC ${ERROR.SERVER.name} ${ERROR.SERVER.code}\n\n`,
  msg => msg,
)

export const errorInstanceToErrorCode = instance => {
  if (instance instanceof Parse) return ERROR.PARSE.code
  if (instance instanceof InvalidRequest) return ERROR.INVALID_REQUEST.code
  if (instance instanceof MethodNotFound) return ERROR.METHOD_NOT_FOUND.code
  if (instance instanceof InvalidParams) return ERROR.INVALID_PARAMS.code
  if (instance instanceof Internal) return ERROR.INTERNAL.code
  if (instance instanceof Server) return ERROR.SERVER.code
}
