import {describe, expect, test, vi} from 'vitest'
import {Interface} from '@ethersproject/abi'
import {encode} from '@fluent-wallet/base32-address'
import {
  FUNGIBLE_TOKEN_EVENT_ABI,
  WRAPPED_NATIVE_TOKEN_EVENT_ABI,
} from '@fluent-wallet/contract-abis/token-abi.js'
import {main} from './index.js'
import {parseAssetChanges} from './parse-trace.js'

const sender = '0x100000000000000000000000000000000000000a'
const recipient = '0x100000000000000000000000000000000000000b'
const token = '0x800000000000000000000000000000000000000c'
const zero = '0x0000000000000000000000000000000000000000'
const tokenInterface = new Interface(FUNGIBLE_TOKEN_EVENT_ABI)
const wrappedInterface = new Interface(WRAPPED_NATIVE_TOKEN_EVENT_ABI)
const wrappedLog = (event, account = sender, amount = 5, address = token) => ({
  address,
  ...wrappedInterface.encodeEventLog(wrappedInterface.getEvent(event), [
    account,
    amount,
  ]),
})
const wrappedTrace = (event, logs = [wrappedLog(event)]) => ({
  type: 'CALL',
  from: sender,
  to: token,
  value: event === 'Deposit' ? '0x5' : '0x0',
  logs,
  calls:
    event === 'Withdrawal'
      ? [{type: 'CALL', from: token, to: sender, value: '0x5'}]
      : [],
})
const nativeTrace = {
  type: 'CALL',
  from: sender,
  to: recipient,
  value: '0x5',
}
const tokenLog = (address, from, to, amount) => ({
  address,
  ...tokenInterface.encodeEventLog(tokenInterface.getEvent('Transfer'), [
    from,
    to,
    amount,
  ]),
})

describe.each([1, 1029])('Core Space network %s', netId => {
  const network = {type: 'cfx', netId}
  const base32 = address => encode(address, netId)

  test.each(['hex', 'base32'])('matches a %s native trace', format => {
    const trace =
      format === 'hex'
        ? nativeTrace
        : {...nativeTrace, from: base32(sender), to: base32(recipient)}
    const result = parseAssetChanges(trace, {
      accounts: [encode(sender, netId, true).toUpperCase()],
      network,
      includeTransfers: true,
    })

    expect(result).toEqual({
      status: 'success',
      changes: [
        {
          account: base32(sender),
          asset: {type: 'native'},
          amount: '5',
          direction: 'out',
        },
      ],
      transfers: [
        {
          from: base32(sender),
          to: base32(recipient),
          asset: {type: 'native'},
          amount: '5',
        },
      ],
    })
  })

  test('aggregates mixed token address formats and formats all returned addresses', () => {
    const result = parseAssetChanges(
      {
        ...nativeTrace,
        value: '0x0',
        logs: [
          tokenLog(token, sender, recipient, 3),
          tokenLog(base32(token), sender, recipient, 6),
        ],
      },
      {accounts: [base32(sender)], network, includeTransfers: true},
    )

    expect(result.changes).toEqual([
      {
        account: base32(sender),
        asset: {type: 'erc20', address: base32(token)},
        amount: '9',
        direction: 'out',
      },
    ])
    expect(result.transfers).toEqual(
      ['3', '6'].map(amount => ({
        from: base32(sender),
        to: base32(recipient),
        asset: {type: 'erc20', address: base32(token)},
        amount,
      })),
    )
  })
})

test('the RPC uses tx.from by default without changing the submitted transaction', async () => {
  const network = {type: 'cfx', netId: 1029}
  const tx = Object.freeze({
    from: encode(sender, network.netId),
    to: encode(recipient, network.netId),
    value: '0x5',
  })
  const debug_traceCall = vi.fn().mockResolvedValue(nativeTrace)
  const result = await main({params: [tx], network, rpcs: {debug_traceCall}})

  expect(result.changes[0]).toMatchObject({account: tx.from, amount: '5'})
  expect(result).not.toHaveProperty('transfers')
  expect(debug_traceCall.mock.calls[0][1][0]).toBe(tx)
  expect(debug_traceCall.mock.calls[0][1][1]).toBe('latest_state')
})

test('Ethereum keeps hex addresses and matches mixed-case accounts', () => {
  const result = parseAssetChanges(
    {
      ...nativeTrace,
      value: '0x0',
      logs: [tokenLog(token, sender, recipient, 7)],
    },
    {
      accounts: [sender.toUpperCase()],
      network: {type: 'eth', netId: 1},
      includeTransfers: true,
    },
  )

  expect(result.changes).toEqual([
    {
      account: sender,
      asset: {type: 'erc20', address: token},
      amount: '7',
      direction: 'out',
    },
  ])
  expect(result.transfers[0]).toEqual({
    from: sender,
    to: recipient,
    asset: {type: 'erc20', address: token},
    amount: '7',
  })
})

test('Core Space minting excludes the Base32 zero address from balance changes', () => {
  const network = {type: 'cfx', netId: 1029}
  const result = parseAssetChanges(
    {...nativeTrace, value: '0x0', logs: [tokenLog(token, zero, sender, 7)]},
    {accounts: [encode(zero, 1029), encode(sender, 1029)], network},
  )

  expect(result.changes).toEqual([
    {
      account: encode(sender, 1029),
      asset: {type: 'erc20', address: encode(token, 1029)},
      amount: '7',
      direction: 'in',
    },
  ])
})

describe.each([
  {type: 'eth', netId: 1},
  {type: 'cfx', netId: 1},
  {type: 'cfx', netId: 1029},
])('wrapped native tokens on $type/$netId', network => {
  const address = value =>
    network.type === 'cfx' ? encode(value, network.netId) : value

  test.each(['Deposit', 'Withdrawal'])('%s changes both assets once', event => {
    const deposit = event === 'Deposit'
    const result = parseAssetChanges(
      wrappedTrace(event, [wrappedLog(event, sender, 5, address(token))]),
      {accounts: [address(sender)], network, includeTransfers: true},
    )
    expect(result.status).toBe('success')
    expect(result.changes).toHaveLength(2)
    expect(result.changes).toEqual(
      expect.arrayContaining([
        {
          account: address(sender),
          asset: {type: 'native'},
          amount: '5',
          direction: deposit ? 'out' : 'in',
        },
        {
          account: address(sender),
          asset: {type: 'erc20', address: address(token)},
          amount: '5',
          direction: deposit ? 'in' : 'out',
        },
      ]),
    )
    expect(result.transfers).toHaveLength(2)
    expect(result.transfers).toContainEqual({
      asset: {type: 'erc20', address: address(token)},
      from: address(deposit ? zero : sender),
      to: address(deposit ? sender : zero),
      amount: '5',
    })
  })
})

describe.each(['Deposit', 'Withdrawal'])('%s event handling', event => {
  const deposit = event === 'Deposit'
  const transfer = tokenLog(
    token,
    deposit ? zero : sender,
    deposit ? sender : zero,
    5,
  )
  const parse = trace =>
    parseAssetChanges(trace, {accounts: [sender], includeTransfers: true})

  test.each(['before', 'after'])(
    'deduplicates a Transfer emitted %s',
    order => {
      const log = wrappedLog(event)
      const result = parse(
        wrappedTrace(
          event,
          order === 'before' ? [transfer, log] : [log, transfer],
        ),
      )
      expect(
        result.transfers.filter(t => t.asset.type === 'erc20'),
      ).toHaveLength(1)
      expect(result.changes.find(c => c.asset.type === 'erc20')).toMatchObject({
        amount: '5',
        direction: deposit ? 'in' : 'out',
      })
    },
  )

  test('matches duplicate events one for one', () => {
    const result = parse(
      wrappedTrace(event, [wrappedLog(event), transfer, wrappedLog(event)]),
    )
    expect(result.transfers.filter(t => t.asset.type === 'erc20')).toHaveLength(
      2,
    )
    expect(result.changes.find(c => c.asset.type === 'erc20').amount).toBe('10')
  })

  test('does not deduplicate events from separate calls', () => {
    const result = parse({
      ...nativeTrace,
      value: '0x0',
      calls: [wrappedTrace(event), wrappedTrace(event, [transfer])],
    })
    expect(result.changes.find(c => c.asset.type === 'erc20').amount).toBe('10')
  })

  test('discards a reverted call and its successful descendants', () => {
    const result = parse({
      ...nativeTrace,
      value: '0x0',
      calls: [
        {
          ...wrappedTrace(event),
          error: 'execution reverted',
          calls: [wrappedTrace(event)],
        },
      ],
    })
    expect(result.changes).toEqual([])
    expect(result.transfers).toEqual([])
  })

  test('preserves top-level reverts', () => {
    const result = parse({...wrappedTrace(event), error: 'execution reverted'})
    expect(result.status).toBe('reverted')
    expect(result.transfers).toEqual([])
  })

  test('does not assign a router balance change to the sender', () => {
    const result = parse(wrappedTrace(event, [wrappedLog(event, recipient)]))
    expect(result.changes.every(c => c.asset.type === 'native')).toBe(true)
    expect(result.transfers.find(t => t.asset.type === 'erc20')).toMatchObject(
      deposit ? {to: recipient} : {from: recipient},
    )
  })

  test('ignores malformed and nonstandard wrapped-token logs', () => {
    const log = wrappedLog(event)
    const result = parse(
      wrappedTrace(event, [
        {...log, data: '0x01'},
        {...log, address: 'invalid'},
        {...log, topics: [...log.topics, log.topics[1]]},
        {...log, topics: [log.topics[0], '0x01']},
      ]),
    )
    expect(result.transfers.every(t => t.asset.type === 'native')).toBe(true)
  })
})
