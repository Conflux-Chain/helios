/**
 * @fileOverview
 * @name utils.js
 */

/**
 * Determines if the passed request is a valid JSON-RPC 2.0 Request
 * @param {Object} request The request
 * @see (@link https://github.com/tedeh/jayson/blob/8f9b2daad744bd4ece3bc33b42687a7c91751ca1/lib/utils.js#L324)
 * @return {Boolean}
 */
export function isValidVersionTwoRequest(request) {
  return Boolean(
    request &&
      typeof request === 'object' &&
      request.jsonrpc === '2.0' &&
      typeof request.method === 'string' &&
      (typeof request.params === 'undefined' ||
        Array.isArray(request.params) ||
        (request.params && typeof request.params === 'object')) &&
      (typeof request.id === 'undefined' ||
        typeof request.id === 'string' ||
        typeof request.id === 'number' ||
        request.id === null),
  )
}

export const isValidRequest = isValidVersionTwoRequest
