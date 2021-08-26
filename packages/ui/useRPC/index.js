import useSWR from 'swr'
import {setupProvider} from './setup-provider.js'
import {useAsyncRetry} from 'react-use'
import {useEffect} from 'react'

export const useRPC = (deps = [], params, opts) => {
  const {
    value: provider,
    loading,
    error,
    retry,
  } = useAsyncRetry(setupProvider, [])

  if (!Array.isArray(deps)) deps = [deps]
  const [method] = deps

  useEffect(() => {
    if (loading) return
    if (error) retry()
  }, [loading, error, retry])

  const providerLoaded = Boolean(!loading && provider && !error)
  return useSWR(
    providerLoaded && method ? deps : null,
    () =>
      provider
        ?.request({method, params})
        .then(({result, error}) => result || error),
    opts,
  )
}
