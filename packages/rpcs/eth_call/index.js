import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import * as spec from '@fluent-wallet/spec'
import {
  blockRef,
  cat,
  map,
  optionalMapKey,
  zeroOrMore,
} from '@fluent-wallet/spec'

const {TxMapSpecs} = genEthTxSchema(spec)
export const NAME = 'eth_call'

export const schemas = {
  input: [
    cat,
    [
      map,
      {closed: true},
      optionalMapKey(TxMapSpecs.from),
      TxMapSpecs.to,
      optionalMapKey(TxMapSpecs.gasPrice),
      optionalMapKey(TxMapSpecs.gas),
      optionalMapKey(TxMapSpecs.nonce),
      optionalMapKey(TxMapSpecs.value),
      optionalMapKey(TxMapSpecs.data),
    ],
    [zeroOrMore, blockRef],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const cache = {
  type: 'block',
  key: ({params}) => {
    const req = params[0]
    return `${NAME}${JSON.stringify(req)}`
  },
}

export const main = async ({f, params}) => {
  let [tx, ref] = params
  ref = ref || 'latest'
  return await f([tx, ref])
}
