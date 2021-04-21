import {fileURLToPath} from 'url'
import {readFile} from 'fs'
import {promisify} from 'util'
import {resolve} from 'path'
import {generateDocumentation} from '@cfxjs/spec/src/doc.js'
import isFileExists from '../is-file-exists.js'

const read = promisify(readFile)

export default async function parseRpcPackage(dir, withSchema) {
  if (dir instanceof URL) dir = fileURLToPath(dir)
  const rpc = {
    path: dir,
    packageJSON: JSON.parse(await read(resolve(dir, 'package.json'))),
    paramDoc: {
      input: {},
    },
    doc: {
      en: 'No doc avaiable',
    },
  }

  rpc.module = await import(resolve(dir, rpc.packageJSON.main))

  if (rpc.module?.schemas?.input) {
    rpc.paramDoc.input = generateDocumentation(rpc.module?.schemas?.input, {
      noSchema: !withSchema,
    })
  }

  if (await isFileExists(resolve(dir, '../doc.js')))
    rpc.doc.en = await import(resolve(dir, '../doc.js'))

  return rpc
}
