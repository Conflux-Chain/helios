export default function ({
  base32Address,
  base32UserAddress,
  Bytes,
  chainId,
  map,
  Uint,
  catn,
  Hash32,
}) {
  const TransactionUnsigned = [
    map,
    {closed: true},
    ['from', base32UserAddress],
    ['to', {optional: true}, base32Address],
    ['value', {optional: true}, Uint],
    ['nonce', {optional: true}, Uint],
    ['data', {optional: true}, Bytes],
    ['gas', {optional: true}, Uint],
    [
      'gasLimit',
      {doc: 'gas limit, same as the "gas" key', optional: true},
      Uint,
    ],
    ['gasPrice', {optional: true}, Uint],
    ['storageLimit', {optional: true}, Uint],
    ['chainId', {optional: true}, chainId],
    ['epochHeight', {optional: true}, Uint],
    ['type', {optional: true}, Uint],
    ['maxPriorityFeePerGas', {optional: true}, Uint],
    ['maxFeePerGas', {optional: true}, Uint],
    [
      'accessList',
      {optional: true},
      [
        catn,
        [
          'AccessListEntry',
          [
            map,
            {closed: true},
            ['address', {optional: true}, base32Address],
            [
              'storageKeys',
              {optional: true},
              [catn, ['32BtyeHexValue', Hash32]],
            ],
          ],
        ],
      ],
    ],
  ]

  const TxMapSpecs = Object.fromEntries(
    TransactionUnsigned.slice(2).map(entry => [entry[0], entry]),
  )
  return {TxMapSpecs, TransactionUnsigned}
}
