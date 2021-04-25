import {access as _access} from 'fs'
import {fileURLToPath} from 'url'
import {promisify} from 'util'

const fsaccess = promisify(_access)

async function access(path) {
  try {
    await fsaccess(path)
    return true
  } catch (e) {} // eslint-disable-line no-empty
  return false
}

export default async function isFileExists(path) {
  if (path instanceof URL) path = fileURLToPath(path)
  return await access(path)
}
