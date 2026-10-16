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

const authorization = {
  address: transaction.to,
  chainId: '0x0',
  nonce: '0x20000000000001',
  yParity: '0x1',
  r: '0x01',
  s: `0x${'f'.repeat(64)}`,
}
const accessEntry = {
  address: transaction.to,
  storageKeys: [`0x${'00'.repeat(32)}`, `0x${'00'.repeat(32)}`],
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
    {transaction: {...transaction, authorizationList: [authorization]}},
  ])('hides unsupported or unresolved state: %j', override => {
    expect(canSimulateTransaction({...supported, ...override})).toBe(false)
  })
})

describe('getSimulateUrl', () => {
  it.each([1, 2])(
    'encodes the complete sendCalls transaction for %i calls',
    count => {
      const calls = [
        {to: transaction.to, value: '0x1', data: '0xaabb'},
        {to: transaction.from, value: '0x2', data: '0xccdd'},
      ].slice(0, count)
      const bundle = buildCallBundleTransaction({
        from: transaction.from,
        chainId: '0x47',
        calls,
      })
      const url = listUrl({
        ...bundle,
        gas: '0x12345',
        maxFeePerGas: '0x42',
        maxPriorityFeePerGas: '0x1',
      })
      const encoded = url.searchParams.get('data')
      const decoded = encoded.startsWith('0x')
        ? encoded
        : `0x${(encoded.startsWith('d1.')
            ? inflateRawSync(Buffer.from(encoded.slice(3), 'base64url'))
            : Buffer.from(encoded.slice(3), 'base64url')
          ).toString('hex')}`
      expect(decoded).toBe(bundle.data)
      expect(url.searchParams.get('to')).toBe(
        count === 1 ? transaction.to : transaction.from,
      )
      expect(url.searchParams.get('value')).toBe(count === 1 ? '0x1' : '0x0')
      expect(url.searchParams.get('gas')).toBe('0x12345')
      expect(url.searchParams.get('maxFeePerGas')).toBe('0x42')
      expect(url.searchParams.get('maxPriorityFeePerGas')).toBe('0x1')
    },
  )
  it('serializes accessList as a single JSON parameter preserving order and duplicates without mutation', () => {
    const lists = {
      accessList: [accessEntry, {...accessEntry, storageKeys: []}, accessEntry],
    }
    const before = JSON.stringify(lists)
    const url = listUrl(lists)
    expect(url.searchParams.getAll('accessList')).toHaveLength(1)
    expect(JSON.parse(url.searchParams.get('accessList'))).toEqual(
      lists.accessList,
    )
    expect(JSON.stringify(lists)).toBe(before)
  })

  it('preserves an empty access list and omits absent lists', () => {
    expect(listUrl({accessList: []}).searchParams.get('accessList')).toBe('[]')
    expect(listUrl({}).searchParams.has('accessList')).toBe(false)
    expect(listUrl({}).searchParams.has('authorizationList')).toBe(false)
  })

  it.each([
    null,
    {},
    [{address: '0x1', storageKeys: []}],
    [{...accessEntry, storageKeys: ['0x1']}],
    '[]',
  ])('rejects malformed accessList %j', accessList => {
    expect(() => listUrl({accessList})).toThrow(/accessList/)
  })

  it.each([null, {}, [], [null], [{address: transaction.to}], [authorization]])(
    'rejects transactions containing authorizationList: %j',
    authorizationList => {
      const input = {accessList: [accessEntry], authorizationList}
      const before = JSON.stringify(input)
      expect(() => listUrl(input)).toThrow(/does not support authorizationList/)
      expect(JSON.stringify(input)).toBe(before)
    },
  )

  it('rejects oversized accessList JSON', () => {
    expect(() => listUrl({accessList: Array(2000).fill(accessEntry)})).toThrow(
      RangeError,
    )
  })

  it.each([
    'https://evm.confluxscan.org',
    'https://evmtestnet.confluxscan.org/',
  ])(
    'uses the transaction Scan origin %s and preserves transaction quantities',
    scanUrl => {
      const url = new URL(
        getSimulateUrl(scanUrl, {...transaction, gasPrice: '0x3b9aca00'}),
      )
      expect(url.origin).toBe(new URL(scanUrl).origin)
      expect(url.pathname).toBe('/simulate-trace')
      expect(Object.fromEntries(url.searchParams)).toEqual({
        ...transaction,
        data: '0xaabb',
        gasPrice: '0x3b9aca00',
      })
    },
  )

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

  it('normalizes empty transfer data and omits absent optional fields', () => {
    const url = new URL(
      getSimulateUrl('https://evm.confluxscan.org', {to: transaction.to}),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      to: transaction.to,
      data: '0x',
    })
  })

  it('writes compressed calldata exactly once', () => {
    const url = new URL(
      getSimulateUrl('https://evm.confluxscan.org', {
        ...transaction,
        data: `0x${'00'.repeat(257)}`,
      }),
    )
    expect(url.searchParams.getAll('data')).toEqual(['d1.Y2AY4QAA'])
  })

  it('allows contract deployment data without a recipient', () => {
    const deployment = {
      from: transaction.from,
      value: transaction.value,
      gas: '0x30d40',
      data: '0x60006000F3',
    }
    const url = new URL(
      getSimulateUrl('https://evm.confluxscan.org', deployment),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      ...deployment,
      data: '0x60006000f3',
    })
    expect(url.searchParams.has('to')).toBe(false)
  })

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
