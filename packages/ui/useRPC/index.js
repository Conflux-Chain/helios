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
  if (typeof deps === 'string') deps = [deps]
  const [method] = deps

  useEffect(() => {
    if (loading) return
    if (error) retry()
  }, [loading, error, retry])

  const {data} = useSWR(
    !loading && provider && !error ? deps : null,
    () =>
      provider
        ?.request({method, params})
        .then(({result, error}) => result || error),
    opts,
  )

  return data
}
