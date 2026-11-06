import * as spec from '@fluent-wallet/spec'
import genCfxTxSchema from '@fluent-wallet/cfx-transaction-schema'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'

const {TxMapSpecs: evmFields} = genEthTxSchema(spec)
const {TxMapSpecs: coreFields} = genCfxTxSchema(spec)
const {cat, map, or, zeroOrOne, blockRef, Hash32, boolean, mapp} = spec

// Simulation accepts partial transactions; estimates additionally need a sender.
export function createTransactionSchemas({requireFrom = false} = {}) {
  const createSchema = fields => [
    map,
    {closed: true},
    ...Object.values(fields).map(entry =>
      requireFrom && entry[0] === 'from' ? entry : spec.optionalMapKey(entry),
    ),
    ['input', {optional: true}, spec.Bytes],
  ]
  return {
    ethTransactionSchema: createSchema(evmFields),
    coreTransactionSchema: createSchema(coreFields),
  }
}

const {ethTransactionSchema, coreTransactionSchema} = createTransactionSchemas()

export const blockSchema = [
  or,
  blockRef,
  spec.epochRef,
  Hash32,
  [
    map,
    {closed: true},
    ['blockHash', Hash32],
    ['requireCanonical', {optional: true}, boolean],
  ],
  [
    map,
    {closed: true},
    ['blockNumber', blockRef],
    ['requireCanonical', {optional: true}, boolean],
  ],
]

export const NAME = 'debug_traceCall'

export const schemas = {
  input: [
    cat,
    [or, ethTransactionSchema, coreTransactionSchema],
    [zeroOrOne, [cat, blockSchema, [zeroOrOne, mapp]]],
  ],
}

export const cache = {
  type: 'block',
  key: ({params, network}) =>
    `${NAME}${JSON.stringify([network?.endpoint, params])}`,
  // Pending state can change without a new block.
  beforeGet: ({params}) => params[1] !== 'pending',
  beforeSet: ({params}) => params[1] !== 'pending',
}
export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}

export const main = async ({f, params, network}) => {
  const [tx, block, options] = params
  const {gasLimit, ...transaction} = tx
  if (transaction.gas === undefined && gasLimit !== undefined)
    transaction.gas = gasLimit
  // debug rpc need gas-price params for estimate, set gasPrice to 20 Gwei if no gas-price in transaction
  if (
    !transaction.gasPrice &&
    !transaction.maxFeePerGas &&
    !transaction.maxPriorityFeePerGas
  )
    transaction.gasPrice = '0x4a817c800'

  const traceParams = [
    transaction,
    block ?? (network?.type === 'cfx' ? 'latest_state' : 'latest'),
  ]
  if (options !== undefined) traceParams.push(options)

  return await f(traceParams)
}
