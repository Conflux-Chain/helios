import {defRpcError} from '@fluent-wallet/errors'

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
  // provider errors https://eips.ethereum.org/EIPS/eip-1193#errors
  USER_REJECTED: {code: 4001, name: 'UserRejected'},
  UNAUTHORIZED: {code: 4100, name: 'Unauthorized'},
  UNSUPPORTED_METHOD: {code: 4200, name: 'UnsupportedMethod'},
  // disconnected from all chain
  DISCONNECTED: {code: 4900, name: 'Disconnected'},
  // disconnected from requested chain
  CHAIN_DISCONNECTED: {code: 4901, name: 'Chain Disconnected'},
  UNRECOGNIZED_CHAIN_ID: {code: 4902, name: 'Unrecognized chain ID'},
}

export const Parse = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.PARSE.name} ${ERROR.PARSE.code}]\n`,
)

export const InvalidRequest = defRpcError(
  () => ``,
  msg =>
    `${msg} [${ERROR.INVALID_REQUEST.name} ${ERROR.INVALID_REQUEST.code}]\n`,
)

export const MethodNotFound = defRpcError(
  () => ``,
  msg =>
    `${msg} [${ERROR.METHOD_NOT_FOUND.name} ${ERROR.METHOD_NOT_FOUND.code}]\n`,
)

export const InvalidParams = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.INVALID_PARAMS.name} ${ERROR.INVALID_PARAMS.code}]\n`,
)

export const Internal = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.INTERNAL.name} ${ERROR.INTERNAL.code}]\n`,
)

export const Server = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.SERVER.name} ${ERROR.SERVER.code}]\n`,
)

export const UserRejected = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.USER_REJECTED.name} ${ERROR.USER_REJECTED.code}]\n`,
)

export const Unauthorized = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.UNAUTHORIZED.name} ${ERROR.UNAUTHORIZED.code}]\n`,
)

export const UnsupportedMethod = defRpcError(
  () => ``,
  msg =>
    `${msg} [${ERROR.UNSUPPORTED_METHOD.name} ${ERROR.UNSUPPORTED_METHOD.code}]\n`,
)

export const Disconnected = defRpcError(
  () => ``,
  msg => `${msg} [${ERROR.DISCONNECTED.name} ${ERROR.DISCONNECTED.code}]\n`,
)

export const ChainDisconnected = defRpcError(
  () => ``,
  msg =>
    `${msg} [${ERROR.CHAIN_DISCONNECTED.name} ${ERROR.CHAIN_DISCONNECTED.code}]\n`,
)

export const UnrecognizedChainId = defRpcError(
  () => ``,
  msg =>
    `${msg} [${ERROR.UNRECOGNIZED_CHAIN_ID.name} ${ERROR.UNRECOGNIZED_CHAIN_ID.code}]\n`,
)

export const errorInstanceToErrorCode = instance => {
  if (instance instanceof Parse) return ERROR.PARSE.code
  if (instance instanceof InvalidRequest) return ERROR.INVALID_REQUEST.code
  if (instance instanceof MethodNotFound) return ERROR.METHOD_NOT_FOUND.code
  if (instance instanceof InvalidParams) return ERROR.INVALID_PARAMS.code
  if (instance instanceof Internal) return ERROR.INTERNAL.code
  if (instance instanceof Server) return ERROR.SERVER.code
  if (instance instanceof UserRejected) return ERROR.USER_REJECTED.code
  if (instance instanceof Unauthorized) return ERROR.UNAUTHORIZED.code
  if (instance instanceof UnsupportedMethod)
    return ERROR.UNSUPPORTED_METHOD.code
  if (instance instanceof Disconnected) return ERROR.DISCONNECTED.code
  if (instance instanceof ChainDisconnected)
    return ERROR.CHAIN_DISCONNECTED.code
  if (instance instanceof UnrecognizedChainId)
    return ERROR.UNRECOGNIZED_CHAIN_ID.code
  if (!instance?.code) return -32000
  if (instance.code >= -32099 && instance.code <= -32000) return instance.code
  return -32000
}

export const guessErrorType = err => {
  if (!err?.code) return Internal
  if (err?.code) {
    if (err.code >= -32099 && err.code <= -32000)
      return defRpcError(
        () => ``,
        msg => `${msg} [${ERROR.SERVER.name} ${err.code}]\n`,
      )
    if (err.code === ERROR.PARSE.code) return Parse
    if (err.code === ERROR.INVALID_REQUEST.code) return InvalidRequest
    if (err.code === ERROR.METHOD_NOT_FOUND.code) return MethodNotFound
    if (err.code === ERROR.INVALID_PARAMS.code) return InvalidParams
    if (err.code === ERROR.INTERNAL.code) return Internal
    if (err.code === ERROR.SERVER.code) return Server
    if (err.code === ERROR.USER_REJECTED) return UserRejected
    if (err.code === ERROR.UNAUTHORIZED.code) return Unauthorized
    if (err.code === ERROR.UNSUPPORTED_METHOD) return UnsupportedMethod
    if (err.code === ERROR.DISCONNECTED) return Disconnected
    if (err.code === ERROR.CHAIN_DISCON) return ChainDisconnected
  }

  return Internal
}

export const parseError = (err, prefix = '', suffix = '') => {
  const C = guessErrorType(err)

  let errmsg = prefix
  if (err?.message) errmsg = errmsg + err.message
  if (err?.data) errmsg = errmsg + ' - ' + err.data
  errmsg = errmsg + suffix

  const error = new C(errmsg)
  error.code = err?.code || error.code
  error.data = err?.data || error.data
  return error
}
