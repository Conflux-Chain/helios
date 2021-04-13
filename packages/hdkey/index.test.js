// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {getNthAccountOfHDKey} from './'
import {generateMnemonic} from 'bip39'

describe('HDKey', function () {
  it('should return a hdkey', async function () {
    const account = getNthAccountOfHDKey({
      mnemonic: generateMnemonic(),
      nth: 1,
      only0x1Prefixed: true,
    })

    expect(account).toBeDefined()
    expect(account.index >= 1).toBe(true)
  })
})
