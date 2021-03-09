import {step} from '@thi.ng/transducers'

import {mapP, sideEffectP} from '.'

describe('mapcat promise xforms', function () {
  describe('mapP', function () {
    it('should flatten the promise', async function () {
      const f = jest.fn(a => a)

      expect(step(mapP(f))(1)).toBe(1)
      expect(f).toBeCalledWith(1)

      step(mapP(f))(Promise.resolve(1))
      expect(f).toBeCalledWith(1)
    })

    describe('sideEffectP', function () {
      it('should flatten the promise', async function () {
        const f = jest.fn()

        step(sideEffectP(f))(1)
        expect(f).toBeCalledWith(1)

        step(sideEffectP(f))(Promise.resolve(1))
        expect(f).toBeCalledWith(1)
      })
    })
  })
})
