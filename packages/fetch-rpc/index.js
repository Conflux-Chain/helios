import ky from 'ky' // eslint-disable-line import/no-unresolved

const DEFAULT_FETCH_OPTS = {
  credentials: 'omit',
  mode: 'cors',
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCode: [408, 413, 429, 500, 502, 503, 504],
    afterStatusCodes: [413, 429, 503],
    maxRetryAfter: Infinity,
    timeout: 10000,
  },
}

export const initFetcher = (opts = {}) => {
  return ky.create({...DEFAULT_FETCH_OPTS, ...opts})
}
