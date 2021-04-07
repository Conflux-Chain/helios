/**
 * @fileOverview
 * @name index.js
 */
import {defError} from '@cfxjs/errors'

export const ERROR = {
  PARSE: {code: '-32700', name: 'ParseError'},
  INVALID_REQUEST: {code: '-32600', name: 'InvalidRequest'},
  METHOD_NOT_FOUND: {code: '-32601', name: 'MethodNotFound'},
  INVALID_PARAMS: {code: '-32602', name: 'InvalidParams'},
  INTERNAL: {code: '-32603', name: 'InternalError'},
  SERVER: {code: '-32000', name: 'ServerError'},
}

export const Parse = defError(
  () => `JSON-RPC ${ERROR.PARSE.name} ${ERROR.PARSE.code}\n`,
  msg => msg,
)

export const InvalidRequest = defError(
  () =>
    `JSON-RPC ${ERROR.INVALID_REQUEST.name} ${ERROR.INVALID_REQUEST.code}\n`,
  msg => msg,
)

export const MethodNotFound = defError(
  () =>
    `JSON-RPC ${ERROR.METHOD_NOT_FOUND.name} ${ERROR.METHOD_NOT_FOUND.code}\n`,
  msg => msg,
)

export const InvalidParams = defError(
  () => `JSON-RPC ${ERROR.INVALID_PARAMS.name} ${ERROR.INVALID_PARAMS.code}\n`,
  msg => msg,
)

export const Internal = defError(
  () => `JSON-RPC ${ERROR.INTERNAL.name} ${ERROR.INTERNAL.code}\n`,
  msg => msg,
)

export const Server = defError(
  () => `JSON-RPC ${ERROR.SERVER.name} ${ERROR.SERVER.code}\n`,
  msg => msg,
)
