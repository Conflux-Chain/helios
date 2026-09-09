import {describe, expect, test} from 'vitest'
import {
  resolveTransactionNonces,
  withConfluxNonceLock,
  withEthereumNonceLock,
} from './index.js'

describe('resolveTransactionNonces', () => {
  test('returns the network pending nonce when nothing is occupied', () => {
    const nonces = resolveTransactionNonces({
      networkPendingNonce: '0x4',
    })

    expect(nonces).toEqual(['0x4'])
  })

  test('returns the first nonce that fills the local gap', () => {
    const nonces = resolveTransactionNonces({
      networkPendingNonce: '0x1',
      occupiedNonces: ['0x1', '0x2', '0x3', '0x5'],
    })

    expect(nonces).toEqual(['0x4'])
  })

  test('returns a consecutive nonce bundle', () => {
    const nonces = resolveTransactionNonces({
      networkPendingNonce: '0x5',
      nonceCount: 4,
    })

    expect(nonces).toEqual(['0x5', '0x6', '0x7', '0x8'])
  })

  test('rejects a bundle that overlaps an occupied nonce', () => {
    expect(() =>
      resolveTransactionNonces({
        networkPendingNonce: '0x4',
        occupiedNonces: ['0x5'],
        nonceCount: 2,
      }),
    ).toThrow('Nonce 0x5 is already occupied')
  })

  test('uses the custom nonce as the start of the bundle', () => {
    const nonces = resolveTransactionNonces({
      networkPendingNonce: '0x5',
      customNonce: '0x8',
      nonceCount: 2,
    })

    expect(nonces).toEqual(['0x8', '0x9'])
  })

  test('rejects a custom nonce below the network pending nonce', () => {
    expect(() =>
      resolveTransactionNonces({
        networkPendingNonce: '0x5',
        customNonce: '0x4',
      }),
    ).toThrow('below network pending nonce')
  })

  test('rejects an occupied nonce inside a custom bundle', () => {
    expect(() =>
      resolveTransactionNonces({
        networkPendingNonce: '0x4',
        occupiedNonces: ['0x7'],
        customNonce: '0x6',
        nonceCount: 2,
      }),
    ).toThrow('Nonce 0x7 is already occupied')
  })
})

const ETH_ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER_ETH_ADDRESS = '0x2222222222222222222222222222222222222222'
const CFX_ADDRESS = 'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'

function createDeferred() {
  let resolve
  const promise = new Promise(done => {
    resolve = done
  })

  return {promise, resolve}
}

describe('nonce locks', () => {
  test.each([
    [
      'Ethereum',
      task =>
        withEthereumNonceLock({chainId: '0x1', address: ETH_ADDRESS}, task),
      task =>
        withEthereumNonceLock(
          {chainId: '0x01', address: ETH_ADDRESS.toUpperCase()},
          task,
        ),
    ],
    [
      'Conflux',
      task => withConfluxNonceLock({address: CFX_ADDRESS}, task),
      task => withConfluxNonceLock({address: CFX_ADDRESS.toUpperCase()}, task),
    ],
  ])(
    'runs tasks serially in the same %s nonce domain',
    async (_name, firstLock, sameLock) => {
      const releaseFirst = createDeferred()
      const releaseSecond = createDeferred()
      const secondStarted = createDeferred()
      const events = []

      const first = firstLock(async () => {
        events.push('first:start')
        await releaseFirst.promise
        events.push('first:end')
      })

      const second = sameLock(async () => {
        events.push('second:start')
        secondStarted.resolve()
        await releaseSecond.promise
        events.push('second:end')
      })

      const third = sameLock(() => {
        events.push('third')
      })

      try {
        expect(events).toEqual(['first:start'])

        releaseFirst.resolve()
        await secondStarted.promise

        expect(events).toEqual(['first:start', 'first:end', 'second:start'])

        releaseSecond.resolve()
        await Promise.all([first, second, third])

        expect(events).toEqual([
          'first:start',
          'first:end',
          'second:start',
          'second:end',
          'third',
        ])
      } finally {
        releaseFirst.resolve()
        releaseSecond.resolve()
        await Promise.allSettled([first, second, third])
      }
    },
  )

  test('continues the queue after a task throws', async () => {
    const releaseFirst = createDeferred()
    const error = new Error('task failed')
    const lockKey = {chainId: '0x1', address: ETH_ADDRESS}
    const events = []

    const first = withEthereumNonceLock(lockKey, async () => {
      events.push('first')
      await releaseFirst.promise
      throw error
    })

    const second = withEthereumNonceLock(lockKey, () => {
      events.push('second')
      return 'next task'
    })

    try {
      expect(events).toEqual(['first'])

      releaseFirst.resolve()

      await expect(first).rejects.toBe(error)
      await expect(second).resolves.toBe('next task')

      expect(events).toEqual(['first', 'second'])
    } finally {
      releaseFirst.resolve()
      await Promise.allSettled([first, second])
    }
  })

  test('does not block unrelated nonce domains', async () => {
    const releaseHeldTask = createDeferred()
    let heldTaskFinished = false
    const starts = []

    const held = withEthereumNonceLock(
      {chainId: '0x1', address: ETH_ADDRESS},
      async () => {
        await releaseHeldTask.promise
        heldTaskFinished = true
      },
    )

    const recordStart = domain => {
      starts.push({
        domain,
        whileHeldTaskIsRunning: !heldTaskFinished,
      })
    }

    const otherChain = withEthereumNonceLock(
      {chainId: '0x2', address: ETH_ADDRESS},
      () => recordStart('other chain'),
    )

    const otherAddress = withEthereumNonceLock(
      {chainId: '0x1', address: OTHER_ETH_ADDRESS},
      () => recordStart('other address'),
    )

    const conflux = withConfluxNonceLock({address: CFX_ADDRESS}, () =>
      recordStart('conflux'),
    )

    releaseHeldTask.resolve()

    await Promise.all([held, otherChain, otherAddress, conflux])

    expect(starts.map(({domain}) => domain)).toEqual(
      expect.arrayContaining(['other chain', 'other address', 'conflux']),
    )
    expect(starts).toHaveLength(3)
    expect(
      starts.every(({whileHeldTaskIsRunning}) => whileHeldTaskIsRunning),
    ).toBe(true)
  })
})
