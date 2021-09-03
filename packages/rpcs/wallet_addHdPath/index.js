import {map, hdPath, stringp} from '@cfxjs/spec'

export const NAME = 'wallet_addHdPath'
export const schemas = {
  input: [
    map,
    {closed: true},
    ['hdPath', hdPath],
    ['name', [stringp, {min: 2, max: 128}]],
  ],
}

export const permissions = {
  external: ['popup'],
  db: ['getHdPathByName', 'getHdPathByValue', 't'],
}
export const main = ({
  Err: {InvalidParams, t},
  db: {getHdPathByName, getHdPathByValue},
  params: {name, hdPath},
}) => {
  if (getHdPathByName(name).length)
    throw InvalidParams('Duplicate hd path name')

  const [dup] = getHdPathByValue(hdPath)
  if (dup) throw InvalidParams(`hd path already added with name ${dup.name}`)

  const {
    tempids: {newHdPathId},
  } = t({eid: 'newHdPathId', hdPath: {value: hdPath, name}})
  return newHdPathId
}
