// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'
import {encrypt} from 'browser-passworder'

describe('wallet_validatePassword', function () {
  describe('main', function () {
    let vault, input
    beforeAll(async () => {
      vault = {type: 'pk', data: await encrypt('11111111', 'foo')}
      input = {
        params: {password: '00000000'},
        rpcs: {wallet_getVaults: async () => [vault]},
      }
    })

    it('should return false with invalid password', async function () {
      const valid = await main(input)
      expect(valid).toBe(false)
    })

    it('should return true with valid password', async function () {
      input.params.password = '11111111'
      const valid = await main(input)
      expect(valid).toBe(true)
    })
  })
})
