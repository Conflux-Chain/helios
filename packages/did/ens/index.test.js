import {expect, it, vi} from 'vitest'
import {hash} from '@ensdomains/eth-ens-namehash'
import ENS from './index.js'

const registry = '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e'
const resolver = `0x${'11'.repeat(20)}`
const account = `0x${'22'.repeat(20)}`
const word = hex => hex.padStart(64, '0')
const encodedAddress = address => `0x${word(address.slice(2))}`

function providerFor(answer) {
  return {
    request: vi.fn(async ({method, params}) => {
      if (method !== 'eth_call') throw new Error(`Unexpected method: ${method}`)
      const [{to, data, input}] = params
      if (to.toLowerCase() === registry) return encodedAddress(resolver)
      if (to.toLowerCase() !== resolver) throw new Error('Unexpected resolver')
      if ((data ?? input).startsWith('0x3b3b57de'))
        return encodedAddress(answer)
      const label = Buffer.from('wallet.eth').toString('hex')
      return `0x${word('20')}${word('a')}${label.padEnd(64, '0')}`
    }),
  }
}

it('resolves ENS names and reverse records with the supplied provider', async () => {
  const provider = providerFor(account)
  const ens = new ENS(provider)
  expect(await ens.getAddress('wallet.eth')).toBe(account)
  expect(await ens.getName(account)).toBe('wallet.eth')
  expect(await ens.getAddresses(['wallet.eth'])).toEqual({
    'wallet.eth': account,
  })
  expect(await ens.getNames([account])).toEqual({[account]: 'wallet.eth'})
  expect(provider.request).toHaveBeenCalledTimes(8)
})

it('sends the exact read-only registry and resolver calls and returns a checksum address', async () => {
  const answer = '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e'
  const node = hash('wallet.eth').slice(2)
  const provider = providerFor(answer)
  expect(await new ENS(provider).getAddress('wallet.eth')).toBe(
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  )
  const calls = provider.request.mock.calls.map(
    ([
      {
        method,
        params: [{to, data}, block],
      },
    ]) => [method, to.toLowerCase(), data, block],
  )
  expect(calls).toEqual([
    ['eth_call', registry, `0x0178b8bf${node}`, 'latest'],
    ['eth_call', resolver, `0x3b3b57de${node}`, 'latest'],
  ])
})

it('also accepts JSON-RPC envelopes from a legacy callback provider', async () => {
  const transport = providerFor(account)
  const provider = {
    send(payload, callback) {
      transport
        .request(payload)
        .then(
          result => callback(null, {jsonrpc: '2.0', id: payload.id, result}),
          callback,
        )
    },
  }
  expect(await new ENS(provider).getName(account)).toBe('wallet.eth')
  expect(transport.request).toHaveBeenCalledTimes(2)
})

it('keeps providers independent and preserves the failed-lookup fallback', async () => {
  const ens = new ENS(providerFor(account))
  const failing = new ENS({
    request: async () => {
      throw new Error('offline')
    },
  })
  expect(await failing.getAddress('wallet.eth')).toBe('')
  expect(await ens.getAddress('wallet.eth')).toBe(account)
})
