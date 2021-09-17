import {readdir} from 'fs'
import {resolve} from 'path'
import {promisify} from 'util'
import {fileURLToPath} from 'url'
import isValidRpcDir from './is-valid-dir.js'
import parseRpcPackage from './parse-package.js'

const getAllRpcs = async (rpcdir, filter = () => true) => {
  if (!rpcdir) rpcdir = new URL('../../rpcs/', import.meta.url)
  if (rpcdir instanceof URL) rpcdir = fileURLToPath(rpcdir)
  const dirs = (
    await Promise.all(
      (
        await promisify(readdir)(rpcdir)
      ).map(async p => {
        if (!(await isValidRpcDir(resolve(rpcdir, p)))) return false
        return await parseRpcPackage(resolve(rpcdir, p))
      }),
    )
  ).reduce((acc, v) => (v ? [...acc, v] : acc), [])

  return dirs.filter(filter)
}

export default getAllRpcs

// console.log(JSON.stringify(await getAllRpcs(), null, 2))
