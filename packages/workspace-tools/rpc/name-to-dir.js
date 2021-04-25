import {fileURLToPath} from 'url'

export default function rpcNameToRpcDir(name) {
  if (typeof name !== 'string') throw new Error('invalid rpc name')
  return fileURLToPath(new URL(`../../rpcs/${name}`, import.meta.url))
}
