import {createBackendRequest} from './request.js'
import {createPaymasterMethods} from './paymaster.js'

export function createBackendClient(options) {
  const request = createBackendRequest(options)

  return {
    ...createPaymasterMethods(request),
  }
}

export {BackendRequestError, BackendServiceError} from './errors.js'
