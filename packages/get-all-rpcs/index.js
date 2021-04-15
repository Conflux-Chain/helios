import {access as _access, readdir, readFile} from 'fs'
import {resolve} from 'path'
import {promisify} from 'util'
import {fileURLToPath} from 'url'
import {generateDocumentation} from '@cfxjs/spec/src/doc.js'

const fsaccess = promisify(_access)
const read = promisify(readFile)

async function access(path) {
  try {
    await fsaccess(path)
    return true
  } catch {} // eslint-disable-line no-empty
  return false
}

const getAllRpcs = async (
  rpcdir = resolve(process.cwd(), 'packages/rpcs'),
  filter = () => true,
) => {
  if (rpcdir instanceof URL) rpcdir = fileURLToPath(rpcdir)
  const dirs = await Promise.all(
    (await promisify(readdir)(rpcdir)).map(async p => {
      const dir = [resolve(rpcdir, p), resolve(rpcdir, p, 'package.json')]
      dir.push(await access(dir[1]))
      if (dir[2]) dir.push(JSON.parse(await read(dir[1])))
      if (dir[2]) dir.push(await import(resolve(dir[0], dir[3].main)))
      if (dir[4]?.schemas?.input)
        dir.push({input: generateDocumentation(dir[4]?.schemas?.input)})
      return dir
    }),
  )

  return dirs
    .reduce(
      (acc, dir) =>
        dir[2] && dir[1].includes('wallet_addVault')
          ? [
              ...acc,
              {
                path: dir[0],
                packageJSONPath: dir[1],
                packageJSON: dir[3],
                module: dir[4],
                doc: dir[5],
              },
            ]
          : acc,
      [],
    )
    .filter(filter)
}

export default getAllRpcs
