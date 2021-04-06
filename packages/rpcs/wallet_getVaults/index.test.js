// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {schema, main} from '.'
import {validate} from '@cfxjs/spec'

describe('wallet_getVaults', function () {
  describe('schema', function () {
    describe('output', function () {
      it('should validate the vaults', async function () {
        expect(validate(schema.output, ['a', 'b'])).toBe(true)
        expect(validate(schema.output, ['a', 1])).toBe(false)
      })
    })
  })

  describe('main', function () {
    it('should return the vaults', async function () {
      const fakeVaults = []
      const input = {
        db: {
          getVault: jest.fn(() => fakeVaults),
        },
      }
      await expect(main(input)).resolves.toEqual(fakeVaults)
    })
  })
})
