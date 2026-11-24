import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {BackendRequestError, BackendServiceError} from './errors.js'

const FETCH_OPTIONS = {
  retry: {limit: 0},
  throwHttpErrors: false,
}

export function createBackendRequest({
  baseUrl,
  fetcher = initFetcher(FETCH_OPTIONS),
}) {
  return async function request(relativePath, {method = 'GET', body} = {}) {
    let response

    try {
      // Use a directory base URL such as "https://example.com/api/".
      const url = new URL(relativePath, baseUrl)
      response = await fetcher(url.href, {
        method,
        ...(body === undefined ? {} : {json: body}),
        throwHttpErrors: false,
      })
    } catch {
      throw new BackendRequestError()
    }

    let result

    if (!response.ok) {
      throw new BackendRequestError()
    }

    try {
      result = await response.json()
    } catch {
      throw new BackendRequestError()
    }

    if (result.code !== 0) {
      throw new BackendServiceError({
        code: result.code,
        data: result.data,
        message: result.message,
      })
    }

    return result.data
  }
}
