import {describe, expect, test, vi} from 'vitest'
import {main} from './index.js'

describe('eth_estimateGas', () => {
  test('forwards the state override as the third parameter', async () => {
    const tx = {
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      type: '0x2',
      data: '0x1234',
    }
    const stateOverride = {
      [tx.from]: {
        code: '0xef01008f5d8d7f3467dd2e34186e232d8b5a5f35462949',
      },
    }
    const f = vi.fn().mockResolvedValue('0x5c5d')

    await expect(
      main({
        f,
        params: [tx, 'latest', stateOverride],
      }),
    ).resolves.toBe('0x5c5d')

    expect(f).toHaveBeenCalledWith([tx, 'latest', stateOverride])
  })
})
