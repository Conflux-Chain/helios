import {expect, test} from 'vitest'
import {smartAccount7702Interface} from '@fluent-wallet/contract-abis/smart-account-7702.js'
import {encodeAccountCalls} from './account-calls.js'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

test('encodes a single call with execute', () => {
  expect(
    encodeAccountCalls([
      {
        to: ZERO_ADDRESS,
        value: 69n,
        data: '0xdeadbeef',
      },
    ]),
  ).toBe(
    '0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000',
  )
})

test('encodes multiple calls with executeBatch', () => {
  const callData = encodeAccountCalls([
    {to: ZERO_ADDRESS},
    {to: ZERO_ADDRESS, value: 69n},
    {to: ZERO_ADDRESS, value: 69n, data: '0xdeadbeef'},
  ])

  expect(callData.slice(0, 10)).toBe('0x34fcd5be')

  const [calls] = smartAccount7702Interface.decodeFunctionData(
    'executeBatch',
    callData,
  )

  expect(
    calls.map(call => ({
      target: call.target,
      value: call.value.toString(),
      callData: call.callData,
    })),
  ).toEqual([
    {target: ZERO_ADDRESS, value: '0', callData: '0x'},
    {target: ZERO_ADDRESS, value: '69', callData: '0x'},
    {target: ZERO_ADDRESS, value: '69', callData: '0xdeadbeef'},
  ])
})
