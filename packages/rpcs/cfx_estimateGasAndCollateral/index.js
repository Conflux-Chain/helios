import {
  map,
  cat,
  base32UserAddress,
  base32Address,
  Uint,
  Bytes,
  epochRefNoMined,
  chainId,
  catn,
  Hash32,
} from '@fluent-wallet/spec'

export const NAME = 'cfx_estimateGasAndCollateral'

export const schemas = {
  input: [
    cat,
    [
      map,
      {closed: true},
      [
        'from',
        {optional: true, doc: 'default to random address'},
        base32UserAddress,
      ],
      [
        'to',
        {optional: true, doc: 'default to null for contract crateion'},
        base32Address,
      ],
      ['chainId', {optional: true}, chainId],
      ['gas', {optional: true, doc: 'default to 0x1dcd6500(500000000)'}, Uint],
      ['gasPrice', {optional: true, doc: 'default to 0x0'}, Uint],
      ['value', {optional: true, doc: 'default to 0x0'}, Uint],
      ['data', {optional: true, doc: 'default to 0x'}, Bytes],
      ['nonce', {optional: true, doc: 'default to 0x0'}, Uint],
      ['storageLimit', {optional: true}, Uint],
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
    ],
    epochRefNoMined,
  ],
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${JSON.stringify(params[0])}`,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, params}) => {
  return await f(params)
}
