import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'

const {TransactionLegacyUnsigned} = genEthTxSchema(spec)

export const NAME = 'eth_estimateGas'

export const schemas = {
  input: [
    spec.cat,
    TransactionLegacyUnsigned.map(k =>
      Array.isArray(k) ? spec.optionalMapKey(k) : k,
    ),
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
