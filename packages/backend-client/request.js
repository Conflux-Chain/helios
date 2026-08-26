import {initFetcher} from '@fluent-wallet/fetch-rpc'
import {BackendRequestError, BackendServiceError} from './errors.js'

const FETCH_OPTIONS = {
  retry: {limit: 0},
  throwHttpErrors: false,
}

function joinUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export function createBackendRequest({
  baseUrl,
  fetcher = initFetcher(FETCH_OPTIONS),
}) {
  return async function request(path, {method = 'GET', body} = {}) {
    let response

    try {
      response = await fetcher(joinUrl(baseUrl, path), {
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
