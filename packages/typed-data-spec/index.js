export default function (type, spec) {
  if (type !== 'cfx' && type !== 'eth') throw new Error('Invalid type ${type}')
  const {map, mapOf, and, stringp, plus, mapp} = spec
  if (!map) throw new Error('Invalid spec instance')

  const typeValueSpec = [
    map,
    {closed: true},
    ['name', stringp],
    ['type', stringp],
  ]
  const typePropsSpec = [plus, typeValueSpec]
  const typesSpec = [
    and,
    [map, [type === 'eth' ? 'EIP712Domain' : 'CIP23Domain', typePropsSpec]],
    [mapOf, stringp, typePropsSpec],
  ]

  return [
    map,
    {closed: true},
    ['types', typesSpec],
    ['primaryType', {doc: 'needs to be defined in types'}, stringp],
    ['domain', mapp],
    ['message', mapp],
  ]
}
