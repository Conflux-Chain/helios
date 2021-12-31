import {fileURLToPath} from 'url'
import path from 'path'
import isFileExists from '../is-file-exists.js'

const cache = {}

export default async function isValidRpcDir(dir) {
  if (dir instanceof URL) dir = fileURLToPath(dir)
  if (cache[dir] !== undefined) return cache[dir]
  if (dir.endsWith('package.json')) cache[dir] = await isFileExists(dir)
  else cache[dir] = await isFileExists(path.resolve(dir, 'package.json'))
  return cache[dir]
}
