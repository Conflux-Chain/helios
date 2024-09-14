import {expect, describe, it, vi} from 'vitest'
import {validate} from '@fluent-wallet/spec'
import {main, schemas} from './index.js'

describe('@fluent-wallet/cfx_epoch-number', () => {
  describe('schemas', () => {
    it('should be able to validate the input', async () => {
      expect(validate(schemas.input)).toBeTruthy()
      expect(validate(schemas.input, [null])).toBeTruthy()
      expect(validate(schemas.input, [undefined])).toBeTruthy()
      expect(validate(schemas.input, ['0x1'])).toBeFalsy()
      expect(validate(schemas.input, ['latest_state'])).toBeTruthy()
      expect(
        validate(schemas.input, ['latest_state', 'latest_mined']),
      ).toBeFalsy()
      expect(validate(schemas.input, [1])).toBeFalsy()
    })
  })

  describe('main', () => {
    it('should call the injected fetch function with the input params', async () => {
      const input = {
        f: vi.fn(p => p),
        params: ['bar'],
      }
      const res = await main(input)
      expect(res).toStrictEqual(input.params)
      expect(input.f).toHaveBeenCalledTimes(1)
    })
  })
})
