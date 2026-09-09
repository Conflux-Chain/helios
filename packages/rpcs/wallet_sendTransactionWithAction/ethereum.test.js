import {describe, expect, test} from 'vitest'
import {ETH_TX_TYPES} from '@fluent-wallet/consts'
import {buildEthereumReplacementTransaction} from './ethereum.js'

const FROM_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const TO_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const DELEGATE_ADDRESS = '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'
const SECOND_DELEGATE_ADDRESS = '0x0000000000000000000000000000000000000001'

const ACCESS_LIST = [
  {
    address: TO_ADDRESS,
    storageKeys: [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    ],
  },
]

const ORIGINAL_TRANSACTION = {
  type: ETH_TX_TYPES.EIP7702,
  from: FROM_ADDRESS,
  chainId: '0x1',
  nonce: '0x5',
  gas: '0x5208',
  maxFeePerGas: '0x64',
  maxPriorityFeePerGas: '0x2',
  to: TO_ADDRESS,
  value: '0x10',
  data: '0x1234',
  accessList: ACCESS_LIST,
  authorizationList: [
    {
      eip7702Authorization: {
        chainId: '0x01',
        address: DELEGATE_ADDRESS,
        nonce: '0x06',
        yParity: '0x1',
        r: '0x1',
        s: '0x2',
      },
    },
    {
      eip7702Authorization: {
        chainId: '0x01',
        address: SECOND_DELEGATE_ADDRESS,
        nonce: '0x07',
        yParity: '0x0',
        r: '0x3',
        s: '0x4',
      },
    },
  ],
}

describe('buildEthereumReplacementTransaction', () => {
  test('preserves the EIP-7702 nonce set and access list for speedup', () => {
    const transaction = buildEthereumReplacementTransaction({
      action: 'speedup',
      originalTransaction: ORIGINAL_TRANSACTION,
      gas: '0x6000',
      maxFeePerGas: '0x70',
      maxPriorityFeePerGas: '0x3',
    })

    expect(transaction).toEqual({
      type: ETH_TX_TYPES.EIP7702,
      from: FROM_ADDRESS,
      chainId: '0x1',
      nonce: '0x5',
      gas: '0x6000',
      maxFeePerGas: '0x70',
      maxPriorityFeePerGas: '0x3',
      to: TO_ADDRESS,
      value: '0x10',
      data: '0x1234',
      accessList: ACCESS_LIST,
      authorizationList: [
        {
          chainId: '0x1',
          address: DELEGATE_ADDRESS,
          nonce: '0x6',
        },
        {
          chainId: '0x1',
          address: SECOND_DELEGATE_ADDRESS,
          nonce: '0x7',
        },
      ],
    })
  })

  test('uses only the transaction nonce for EIP-7702 cancellation', () => {
    const transaction = buildEthereumReplacementTransaction({
      action: 'cancel',
      originalTransaction: ORIGINAL_TRANSACTION,
    })

    expect(transaction).toEqual({
      type: ETH_TX_TYPES.EIP1559,
      from: FROM_ADDRESS,
      chainId: '0x1',
      nonce: '0x5',
      gas: '0x5208',
      maxFeePerGas: '0x64',
      maxPriorityFeePerGas: '0x2',
      to: FROM_ADDRESS,
      value: '0x0',
      data: '0x',
    })
  })
})
