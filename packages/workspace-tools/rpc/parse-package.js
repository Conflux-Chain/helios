import {fileURLToPath} from 'url'
import {readFile} from 'fs'
import {promisify} from 'util'
import {resolve} from 'path'
import {generateDocumentation} from '@fluent-wallet/spec/src/doc.js'
import pathToName from './path-to-name.js'

import isFileExists from '../is-file-exists.js'

const read = promisify(readFile)

export default async function parseRpcPackage(dir, withSchema) {
  if (dir instanceof URL) dir = fileURLToPath(dir)
  const rpc = {
    name: pathToName(dir),
    path: dir,
    packageJSON: JSON.parse(await read(resolve(dir, 'package.json'))),
    paramDoc: {},
    doc: {
      en: 'No doc avaiable',
    },
  }

  rpc.module = await import(resolve(dir, rpc.packageJSON.main || 'index.js'))

  if (rpc.module?.schemas?.input) {
    rpc.paramDoc.input = generateDocumentation(
      rpc.module?.schemas?.input,
      {
        noSchema: !withSchema,
      },
      rpc.module.NAME,
    )
  }

  if (await isFileExists(resolve(dir, '../doc.js')))
    rpc.doc.en = await import(resolve(dir, '../doc.js'))

  return rpc
}
