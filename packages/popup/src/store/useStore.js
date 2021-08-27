import create from 'zustand'
import {useEffect} from 'react'
import {useRPC} from '@cfxjs/use-rpc'
import {identity} from '@cfxjs/compose'
import {INITIAL_STORE} from './init-store.js'
import {RPC_CONFIG} from './rpc-config.js'

const protectDeps = (method, deps) => {
  if (deps === undefined) return method
  if (deps === null) return null
  if (!Array.isArray(deps)) deps = [deps]
  return [method, ...deps]
}

const createUseRPCHook =
  ({
    method,
    key,
    init,
    set,
    get,
    before = [identity],
    afterGet = [identity],
    afterSet,
  } = {}) =>
  (deps, params, opts = {}) => {
    deps = protectDeps(method, deps)

    opts = {fallbackData: init, ...opts}
    const {
      deps: newDeps,
      params: newParams,
      opts: newOpts,
    } = before.reduce((acc, fn) => fn({...acc, set, get}), {deps, params, opts})

    const {data, error, isValidating, mutate} = useRPC(
      newDeps,
      newParams,
      newOpts,
    )

    const afterGetRst = afterGet.reduce(
      (acc, fn) => {
        if (!acc) return acc
        return fn({...acc, set, get})
      },
      {data, error, isValidating, mutate},
    )

    if (!afterGetRst) return

    const {
      data: newData,
      error: newError,
      isValidating: newIsValidating,
      mutate: newMutate,
    } = afterGetRst

    useEffect(() => {
      set({
        [key]: {
          [`${key}Data`]: newData,
          [`${key}Error`]: newError,
          [`${key}IsValidating`]: newIsValidating,
          [`${key}Mutate`]: newMutate || mutate,
        },
      })
    }, [newData, newError, newIsValidating, newMutate, mutate])

    afterSet &&
      afterSet({
        data: newData,
        error: newError,
        isValidating: newIsValidating,
        set,
        get,
      })

    return {
      data: newData,
      error: newError,
      isValidating: newIsValidating,
      mutate,
    }
  }

const useGlobalStore = create((set, get) => {
  const store = RPC_CONFIG.reduce(
    (acc, {method, key, init, before, afterGet, afterSet}) => {
      return {
        ...acc,
        [key]: {
          [`${key}Data`]: init,
          [`${key}Error`]: init,
          [`${key}IsValidating`]: true,
          [`${key}Mutate`]: init,
        },
        [`get${key[0].toUpperCase()}${key.substr(1, key.length - 1)}`]:
          createUseRPCHook({
            method,
            key,
            init,
            before,
            afterGet,
            afterSet,
            set,
            get,
          }),
      }
    },
    INITIAL_STORE(set, get),
  )

  return store
})

export const useStore = (args = {}) => {
  const store = useGlobalStore()

  const storeProxy = new Proxy(store, {
    get() {
      const key = arguments[1]
      const {deps, params, opts} = args[key] || {}

      if (store[key]) {
        const getfn = `get${key[0].toUpperCase()}${key.substr(
          1,
          key.length - 1,
        )}`
        if (store[getfn]) store[getfn](deps, params, opts)
      }

      return store[key]
    },
  })

  return storeProxy
}
