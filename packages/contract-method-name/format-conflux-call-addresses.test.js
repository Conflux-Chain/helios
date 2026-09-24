import {expect, it} from 'vitest'
import {Interface} from '@ethersproject/abi'
import {decode} from '@fluent-wallet/base32-address'
import {formatConfluxCallAddresses} from './format-conflux-call-addresses.js'

it('formats nested addresses without changing bytes or the original result', () => {
  const base32Address = 'cfxtest:aaktk1zbvj0snrxuc1m60deh1fh0ka862e2b78mnvs'
  const hexAddress = decode(base32Address).hexAddress
  const iface = new Interface([
    'function distribute(tuple(address[] recipients, bytes20 reference)[] batches)',
  ])
  const batches = [[[hexAddress], hexAddress]]
  const decodedCall = iface.parseTransaction({
    data: iface.encodeFunctionData('distribute', [batches]),
  })

  const formattedCall = formatConfluxCallAddresses(decodedCall, 1)
  const batch = formattedCall.args.batches[0]

  expect(formattedCall.args.batches).toBe(formattedCall.args[0])
  expect(batch.recipients).toBe(batch[0])
  expect(batch.recipients).toEqual([base32Address])
  expect(batch.reference).toBe(hexAddress.toLowerCase())
  expect(decodedCall.args.batches[0].recipients[0].toLowerCase()).toBe(
    hexAddress.toLowerCase(),
  )
})
