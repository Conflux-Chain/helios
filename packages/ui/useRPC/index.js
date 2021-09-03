import useSWR from 'swr'
import {setupProvider} from './setup-provider.js'
import {useAsyncRetry} from 'react-use'
import {useEffect} from 'react'

const globalThis = window ?? global

export const useRPCProvider = () => {
  const {
    value: provider,
    loading,
    error,
    retry,
  } = useAsyncRetry(setupProvider, [])

  useEffect(() => {
    if (loading) return
    if (error) retry()
  }, [loading, error, retry])

  return {
    provider,
    loading,
    error,
    retry,
  }
}

export const useRPC = (deps = [], params, opts) => {
  const {provider} = useRPCProvider()
  const providerLoaded = Boolean(
    globalThis.___CFXJS_USE_RPC__PRIVIDER || provider,
  )
  return useRPCRaw(
    globalThis.___CFXJS_USE_RPC__PRIVIDER || provider,
    providerLoaded ? deps : null,
    params,
    opts,
  )
}

export const useRPCRaw = (provider, deps = [], params, opts) => {
  if (!Array.isArray(deps)) deps = [deps]
  const [method] = deps

  return useSWR(
    method ? deps : null,
    () =>
      provider?.request({method, params}).then(({result, error}) => {
        if (error) throw error
        return result
      }),
    opts,
  )
}
