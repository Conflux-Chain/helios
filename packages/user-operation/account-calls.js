import {smartAccount7702Interface} from '@fluent-wallet/contract-abis/smart-account-7702.js'

export const SMART_ACCOUNT_7702_STUB_SIGNATURE =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

export function encodeAccountCalls(calls) {
  if (calls.length === 1) {
    const [call] = calls

    return smartAccount7702Interface.encodeFunctionData('execute', [
      call.to,
      call.value ?? 0,
      call.data ?? '0x',
    ])
  }

  return smartAccount7702Interface.encodeFunctionData('executeBatch', [
    calls.map(call => ({
      target: call.to,
      value: call.value ?? 0,
      callData: call.data ?? '0x',
    })),
  ])
}
