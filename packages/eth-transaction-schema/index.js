export default function ({
  map,
  ethHexAddress,
  Hash32,
  Uint,
  Byte,
  Bytes,
  and,
  eq,
  chainId,
  catn,
  optionalMapKey,
}) {
  const AccessEntrySpec = [
    map,
    {closed: true},
    ['address', {optional: true}, ethHexAddress],
    ['storageKeys', {optional: true}, [catn, ['32BtyeHexValue', Hash32]]],
  ]
  const AccessListSpec = [catn, ['AccessListEntry', AccessEntrySpec]]
  const TxMapSpecs = {
    from: ['from', ethHexAddress],
    type: ['type', {doc: 'EIP 2718 Type'}, Byte],
    nonce: ['nonce', Uint],
    to: ['to', {doc: 'Only optional when creating contract'}, ethHexAddress],
    gas: ['gas', {doc: 'gas limit'}, Uint],
    gasLimit: ['gasLimit', {doc: 'gas limit, same as the "gas" key'}, Uint],
    gasPrice: ['gasPrice', {doc: 'gas price'}, Uint],
    value: ['value', Uint],
    data: ['data', {doc: 'input data'}, Bytes],
    maxPriorityFeePerGas: ['maxPriorityFeePerGas', Uint],
    maxFeePerGas: ['maxFeePerGas', Uint],
    accessList: ['accessList', AccessListSpec],
    chainId: ['chainId', chainId],
  }
  // EIP-2930
  const Transaction2930Unsigned = [
    map,
    {closed: true},
    TxMapSpecs.from,

    [
      TxMapSpecs.type[0],
      optionalMapKey(TxMapSpecs.type)[1],
      [and, TxMapSpecs.type[2], [eq, '0x1']],
    ],
    optionalMapKey(TxMapSpecs.nonce),
    optionalMapKey(TxMapSpecs.to),
    optionalMapKey(TxMapSpecs.gas),
    optionalMapKey(TxMapSpecs.gasLimit),
    optionalMapKey(TxMapSpecs.value),
    optionalMapKey(TxMapSpecs.data),
    optionalMapKey(TxMapSpecs.gasPrice),
    optionalMapKey(TxMapSpecs.accessList),
    optionalMapKey(TxMapSpecs.chainId),
  ]
  // EIP-1559
  const Transaction1559Unsigned = [
    map,
    {closed: true},
    TxMapSpecs.from,

    [
      TxMapSpecs.type[0],
      optionalMapKey(TxMapSpecs.type)[1],
      [and, TxMapSpecs.type[2], [eq, '0x2']],
    ],
    optionalMapKey(TxMapSpecs.nonce),
    optionalMapKey(TxMapSpecs.to),
    optionalMapKey(TxMapSpecs.gas),
    optionalMapKey(TxMapSpecs.gasLimit),
    optionalMapKey(TxMapSpecs.value),
    optionalMapKey(TxMapSpecs.data),
    optionalMapKey(TxMapSpecs.maxPriorityFeePerGas),
    optionalMapKey(TxMapSpecs.maxFeePerGas),
    optionalMapKey(TxMapSpecs.accessList),
    optionalMapKey(TxMapSpecs.chainId),
    optionalMapKey(TxMapSpecs.gasPrice), //actually no gasPrice params for EIP-1559 transaction,but sometimes, the dapp developer will pass this param
  ]
  // EIP-155
  const TransactionLegacyUnsigned = [
    map,
    {closed: true},
    TxMapSpecs.from,

    [
      TxMapSpecs.type[0],
      optionalMapKey(TxMapSpecs.type)[1],
      [and, TxMapSpecs.type[2], [eq, '0x0']],
    ],

    optionalMapKey(TxMapSpecs.nonce),
    optionalMapKey(TxMapSpecs.to),
    optionalMapKey(TxMapSpecs.gas),
    optionalMapKey(TxMapSpecs.gasLimit),
    optionalMapKey(TxMapSpecs.value),
    optionalMapKey(TxMapSpecs.data),
    optionalMapKey(TxMapSpecs.gasPrice),
    optionalMapKey(TxMapSpecs.chainId),
  ]

  return {
    AccessEntrySpec,
    AccessListSpec,
    TxMapSpecs,
    Transaction2930Unsigned,
    Transaction1559Unsigned,
    TransactionLegacyUnsigned,
  }
}
