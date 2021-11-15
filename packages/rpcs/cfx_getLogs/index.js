import {
  Uint,
  map,
  cat,
  epochRefNoMined,
  Bytes32,
  catn,
  base32ContractAddress,
  or,
  nul,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_getLogs'

const topicUnitSchema = [or, nul, Bytes32]
const topicSchema = [
  or,
  topicUnitSchema,
  [catn, {min: 1, max: 3}, ['topic unit', topicUnitSchema]],
]

export const schemas = {
  input: [
    cat,
    [
      map,
      {closed: true},
      ['fromEpoch', {optional: true}, epochRefNoMined],
      ['toEpoch', {optional: true}, epochRefNoMined],
      [
        'blockHashes',
        {optional: true},
        [catn, {min: 1, max: 128}, ['blockHash', Bytes32]],
      ],
      [
        'address',
        {optional: true},
        [catn, ['contract address to search', base32ContractAddress]],
      ],
      [
        'topics',
        {optional: true},
        [catn, {min: 1, max: 4}, ['topic', topicSchema]],
      ],
      ['limit', {optional: true}, Uint],
    ],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({f, params}) => {
  if (!params.fromEpoch) params.toEpoch = 'latest_checkpoint'
  if (!params.toEpoch) params.toEpoch = 'latest_state'
  return f(params)
}
