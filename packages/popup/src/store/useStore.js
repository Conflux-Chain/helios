import {useRPC} from '@cfxjs/use-rpc'
import {useEffect, useRef} from 'react'
import create from 'zustand'
import {INITIAL_STORE} from './init-store.js'
import {RPC_CONFIG} from './rpc-config.js'

const protectDeps = (method, deps) => {
  if (deps === undefined) return method
  if (deps === null) return null
  if (!Array.isArray(deps)) deps = [deps]
  return [method, ...deps]
}

const createUseRPCHook =
  ({method, key, init, set, get, before = [], afterGet = [], afterSet} = {}) =>
  (deps, params, opts = {}) => {
    const stateDepsRef = useRef({
      data: false,
      error: false,
      isValidating: false,
    })
    deps = protectDeps(method, deps)

    opts = {fallbackData: init, ...opts}
    const {
      deps: newDeps,
      params: newParams,
      opts: newOpts,
    } = before.reduce((acc, fn) => fn({...acc, set, get}), {
      deps,
      params,
      opts,
    }) || {deps, params, opts}

    const rst = useRPC(newDeps, newParams, newOpts)
    const getRst = {
      mutate: rst.mutate,
      get data() {
        stateDepsRef.current.data = true
        return rst.data
      },
      get error() {
        stateDepsRef.current.error = true
        return rst.error
      },
      get isValidating() {
        stateDepsRef.current.isValidating = true
        return rst.isValidating
      },
    }

    const afterGetRst = afterGet.length
      ? afterGet.reduce((acc, fn) => {
          if (!acc) return acc
          acc.set = set
          acc.get = get
          return fn(acc)
        }, getRst)
      : getRst

    if (!afterGetRst) return

    const newRst = afterGetRst

    const getNewRst = {
      mutate: newRst.mutate,
      get [`${key}Data`]() {
        stateDepsRef.current.data = true
        return newRst.data
      },
      get [`${key}Error`]() {
        stateDepsRef.current.error = true
        return newRst.error
      },
      get [`${key}IsValidating`]() {
        stateDepsRef.current.isValidating = true
        return newRst.isValidating
      },
    }

    useEffect(() => {
      set({
        [key]: getNewRst,
      })
    }, [
      stateDepsRef.current.data && newRst.data,
      stateDepsRef.current.error && newRst.error,
      stateDepsRef.current.isValidating && newRst.isValidating,
    ])

    const finalRst = {
      mutate: rst.mutate,
      get data() {
        stateDepsRef.current.data = true
        return getNewRst[`${key}Data`]
      },
      get error() {
        stateDepsRef.current.error = true
        return getNewRst[`${key}Error`]
      },
      get isValidating() {
        stateDepsRef.current.isValidating = true
        return getNewRst[`${key}IsValidating`]
      },
    }

    useEffect(() => {
      // afterSet is side effect only fn, protect the main fn from it
      try {
        afterSet && afterSet(finalRst, get, set)
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }, [
      stateDepsRef.current.data && newRst.data,
      stateDepsRef.current.error && newRst.error,
      stateDepsRef.current.isValidating && newRst.isValidating,
    ])

    return finalRst
  }

const useGlobalStore = create((set, get) => {
  const store = RPC_CONFIG.reduce(
    (acc, {method, key, init, before, afterGet, afterSet}) => {
      return {
        ...acc,
        [key]: {
          [`${key}Data`]: init,
          [`${key}Error`]: init,
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
