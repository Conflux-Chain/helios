import {
  Uint,
  map,
  epochRefNoMined,
  Bytes32,
  base32ContractAddress,
  zeroOrOne,
  or,
  repeat,
  nul,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_getLogs'

const topicUnitSchema = [or, nul, Bytes32]
const topicSchema = [
  or,
  topicUnitSchema,
  [repeat, {min: 1, max: 3}, topicUnitSchema],
]

export const schemas = {
  input: [
    zeroOrOne,
    [
      map,
      {closed: true},
      ['fromEpoch', {optional: true}, epochRefNoMined],
      ['toEpoch', {optional: true}, epochRefNoMined],
      ['blockHashes', {optional: true}, [repeat, {min: 0, max: 128}, Bytes32]],
      ['address', {optional: true}, [repeat, base32ContractAddress]],
      ['topics', {optional: true}, [repeat, {min: 0, max: 4}, topicSchema]],
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
