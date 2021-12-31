import {watch} from 'chokidar'
import {fileURLToPath} from 'url'
import path from 'path'
import isValidRpcDir from './is-valid-dir.js'
import rpcPathToRpcName from './path-to-name.js'
import rpcNameToRpcDir from './name-to-dir.js'

const dirname = fileURLToPath(new URL('./', import.meta.url))
const rpcsDir = path.resolve(dirname, '../../rpcs')

export default function watchRpcs(fn /* opts = {} */) {
  const watcher = watch(`${rpcsDir}/*/*.{js,jsx,mdx,json}`, {
    ignored: /(^|[/\\])\../, // ignore dotfiles
  })

  const close = watcher.close.bind(watcher)
  process.on('exit', close)
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  process.on('SIGUSR1', close)
  process.on('SIGUSR2', close)

  watcher.on('change', async path => {
    try {
      const rpcName = rpcPathToRpcName(path)
      const rpcDir = rpcNameToRpcDir(rpcName)
      if (await isValidRpcDir(rpcDir)) fn({path, dir: rpcDir, name: rpcName})
    } catch (err) {} // eslint-disable-line no-empty
  })

  return watcher
}
