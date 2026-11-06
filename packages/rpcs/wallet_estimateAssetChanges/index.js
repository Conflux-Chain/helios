import * as spec from '@fluent-wallet/spec'
import {
  createTransactionSchemas,
  blockSchema,
} from '@fluent-wallet/debug_trace-call'
import {parseAssetChanges} from './parse-trace.js'
import {
  failedEstimate,
  isExecutionRevertError,
  isUnsupportedTraceError,
} from './estimate-status.js'

const {cat, map, or, zeroOrOne, oneOrMore, boolean, ethHexAddress, maybe} = spec
const {ethTransactionSchema, coreTransactionSchema} = createTransactionSchemas({
  requireFrom: true,
})

const inputSchema = (transaction, block, address) => [
  cat,
  transaction,
  [
    zeroOrOne,
    [
      cat,
      [maybe, block],
      [
        zeroOrOne,
        [
          map,
          {closed: true},
          ['accounts', {optional: true}, [oneOrMore, address]],
          ['includeTransfers', {optional: true}, boolean],
        ],
      ],
    ],
  ],
]

export const NAME = 'wallet_estimateAssetChanges'

export const schemas = {
  input: [
    or,
    inputSchema(coreTransactionSchema, blockSchema, spec.base32Address),
    inputSchema(ethTransactionSchema, blockSchema, ethHexAddress),
  ],
}

export const permissions = {
  locked: true,
  methods: ['debug_traceCall'],
  external: ['popup'],
}

export const main = async ({params, network, rpcs}) => {
  const includeTransfers = params?.[2]?.includeTransfers === true
  const [tx, block, {accounts = [tx.from]} = {}] = params
  let trace
  try {
    trace = await rpcs.debug_traceCall({errorFallThrough: true}, [
      tx,
      block ?? (network.type === 'cfx' ? 'latest_state' : 'latest'),
      {
        tracer: 'callTracer',
        tracerConfig: {onlyTopCall: false, withLog: true},
      },
    ])
  } catch (error) {
    if (isUnsupportedTraceError(error))
      return failedEstimate('unsupported', error, includeTransfers)

    // Preserve parameter errors from the child RPC/node as JSON-RPC errors too.
    if (Number(error?.code) === -32602) throw error

    return failedEstimate(
      isExecutionRevertError(error) ? 'reverted' : 'failed',
      error,
      includeTransfers,
    )
  }

  try {
    return parseAssetChanges(trace, {accounts, includeTransfers, network})
  } catch (error) {
    // An unreadable trace does not establish an execution failure.
    return failedEstimate('failed', error, includeTransfers)
  }
}
