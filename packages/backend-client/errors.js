/**
 * Error raised when no usable backend response is available.
 */
export class BackendRequestError extends Error {
  constructor() {
    super('Backend request failed')
    this.name = 'BackendRequestError'
  }
}

/**
 * Error returned by the backend with a non-zero business code.
 */
export class BackendServiceError extends Error {
  constructor({code, data, message}) {
    super(message || 'Backend service returned an error')
    this.name = 'BackendServiceError'
    this.code = code

    if (data !== undefined) {
      this.data = data
    }
  }
}
