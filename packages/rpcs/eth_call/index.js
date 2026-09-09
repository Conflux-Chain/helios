import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'
import * as spec from '@fluent-wallet/spec'
import {
  blockRef,
  cat,
  map,
  mapp,
  optionalMapKey,
  zeroOrMore,
  zeroOrOne,
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
    [zeroOrOne, mapp],
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
  key: ({params}) => `${NAME}${JSON.stringify(params)}`,
}

export const main = async ({f, params}) => {
  let [tx, ref, stateOverride] = params
  ref = ref || 'latest'

  return await f(stateOverride ? [tx, ref, stateOverride] : [tx, ref])
}
