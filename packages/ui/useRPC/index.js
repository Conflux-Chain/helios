import browser from 'webextension-polyfill'
import useSWR from 'swr'
import {rpcStream} from '@cfxjs/extension-runtime/rpc-stream.js'
import {initProvider} from '@cfxjs/provider-api'

let RUNTIME_NAME = 'popup'
let PROVIDER = null

export const initHooks = ({name} = {}) => {
  RUNTIME_NAME = name
}

const setupProvider = ({name = RUNTIME_NAME} = {}) => {
  if (PROVIDER) return
  const port = browser.runtime.connect({name})
  port.onDisconnect.addListener(() => (PROVIDER = null))
  PROVIDER = initProvider(rpcStream(port))
}

export const useRPC = (deps = [], params) => {
  setupProvider()
  if (typeof deps === 'string') deps = [deps]
  const [method] = deps
  const {data} = useSWR(deps, () =>
    PROVIDER.request({method, params}).then(
      ({result, error}) => result || error,
    ),
  )
  return data
}
