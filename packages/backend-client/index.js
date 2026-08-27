import {createBackendRequest} from './request.js'
import {createPaymasterMethods} from './paymaster.js'
import {createTokenPayMethods} from './token-pay.js'

export function createBackendClient(options) {
  const request = createBackendRequest(options)

  return {
    ...createTokenPayMethods(request),
    ...createPaymasterMethods(request),
  }
}

export {BackendRequestError, BackendServiceError} from './errors.js'
