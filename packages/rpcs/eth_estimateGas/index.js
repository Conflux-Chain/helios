import * as spec from '@fluent-wallet/spec'
import genEthTxSchema from '@fluent-wallet/eth-transaction-schema'

const {
  TransactionLegacyUnsigned,
  Transaction1559Unsigned,
  Transaction2930Unsigned,
} = genEthTxSchema(spec)

export const NAME = 'eth_estimateGas'

export const schemas = {
  input: [
    spec.cat,
    [
      spec.or,
      TransactionLegacyUnsigned.map(k =>
        Array.isArray(k) ? spec.optionalMapKey(k) : k,
      ),
      Transaction1559Unsigned.map(k =>
        Array.isArray(k) ? spec.optionalMapKey(k) : k,
      ),
      Transaction2930Unsigned.map(k =>
        Array.isArray(k) ? spec.optionalMapKey(k) : k,
      ),
    ],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  // network without EIP-1559 support may throw error when estimate with `type`
  if (params[0].type === '0x0' || params[0].type === null) {
    const [{type, ...newParams}] = params // eslint-disable-line no-unused-vars
    params = [newParams]
  }
  return await f(params)
}
