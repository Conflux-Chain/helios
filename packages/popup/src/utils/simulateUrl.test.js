import {describe, expect, it} from 'vitest'
import {inflateRawSync} from 'node:zlib'
import {buildCallBundleTransaction} from '@fluent-wallet/eip-5792'
import {canSimulateTransaction, getSimulateUrl} from './simulateUrl'

const transaction = {
  from: '0x1111111111111111111111111111111111111111',
  to: '0x2222222222222222222222222222222222222222',
  value: '0x2000000000000001',
  data: '0xAABB',
  gas: '0x5208',
}

const listUrl = lists =>
  new URL(
    getSimulateUrl('https://evm.confluxscan.org', {
      ...transaction,
      ...lists,
    }),
  )

describe('canSimulateTransaction', () => {
  const supported = {
    transaction,
    network: {type: 'eth', chainId: '0x406'},
    enabled: true,
  }

  it.each(['0x406', '0x47'])('supports eSpace %s', chainId => {
    expect(
      canSimulateTransaction({...supported, network: {type: 'eth', chainId}}),
    ).toBe(true)
  })

  it.each([
    {enabled: false},
    {enabled: undefined},
    {network: undefined},
    {transaction: null},
    {network: {type: 'eth', chainId: '0x1'}},
    {network: {type: 'cfx', chainId: '0x406'}},
    {sponsorshipLoading: true},
    {sponsored: true},
    {transaction: {...transaction, authorizationList: []}},
    {transaction: {...transaction, authorizationList: null}},
  ])('hides unsupported or unresolved state: %j', override => {
    expect(canSimulateTransaction({...supported, ...override})).toBe(false)
  })
})

describe('getSimulateUrl', () => {
  it('preserves the complete batch calldata and execution target', () => {
    const bundle = buildCallBundleTransaction({
      from: transaction.from,
      chainId: '0x47',
      calls: [
        {to: transaction.to, value: '0x1', data: '0xaabb'},
        {to: transaction.from, value: '0x2', data: '0xccdd'},
      ],
    })
    const params = listUrl(bundle).searchParams
    expect(params.getAll('data')).toHaveLength(1)
    const encoded = params.get('data')
    expect(encoded.startsWith('d1.')).toBe(true)
    const decoded = inflateRawSync(Buffer.from(encoded.slice(3), 'base64url'))
    expect(`0x${decoded.toString('hex')}`).toBe(bundle.data)
    expect(params.get('to')).toBe(transaction.from)
    expect(params.get('value')).toBe('0x0')
  })

  it('forwards EIP-1559 fees without unrelated transaction fields', () => {
    const url = new URL(
      getSimulateUrl('https://evm.confluxscan.org', {
        ...transaction,
        maxFeePerGas: '0x123456789abcdef',
        maxPriorityFeePerGas: '0x0',
        nonce: '0x7',
        chainId: '0x406',
        type: '0x2',
      }),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      ...transaction,
      data: '0xaabb',
      maxFeePerGas: '0x123456789abcdef',
      maxPriorityFeePerGas: '0x0',
    })
  })

  it.each([
    [{to: transaction.to}, {to: transaction.to, data: '0x'}],
    [{data: '0x60006000F3'}, {data: '0x60006000f3'}],
  ])(
    'omits absent fields for transfers and deployments: %j',
    (tx, expected) => {
      const url = new URL(getSimulateUrl('https://evm.confluxscan.org', tx))
      expect(Object.fromEntries(url.searchParams)).toEqual(expected)
    },
  )

  it('rejects unsupported Scan URLs and malformed calldata', () => {
    expect(() => getSimulateUrl('javascript:alert(1)', transaction)).toThrow()
    expect(() => getSimulateUrl(undefined, transaction)).toThrow()
    expect(() =>
      getSimulateUrl('https://evm.confluxscan.org', {
        ...transaction,
        data: '0x1',
      }),
    ).toThrow(TypeError)
  })
})
