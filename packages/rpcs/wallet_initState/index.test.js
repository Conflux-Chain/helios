import {expect} from '@jest/globals'
import {main, schemas} from './'
import {validate} from '@cfxjs/spec'

describe('wallet_initState', () => {
  describe('schema', function () {
    it('should validate the data on schema', async function () {
      expect(validate(schemas.input, {oldState: {}})).toBeTruthy()
      expect(
        validate(schemas.input, {oldState: {}, initState: {}}),
      ).toBeTruthy()
      expect(validate(schemas.input, {})).toBeTruthy()
      expect(validate(schemas.input, {oldState: undefined})).toBeFalsy()
      expect(validate(schemas.input, {initState: 'str'})).toBeFalsy()
    })
  })

  describe('main', function () {
    it('should set the right initial state', async function () {
      // empty state
      const arg = {
        setWalletState: jest.fn(),
      }
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({})

      // empty params
      arg.params = {}
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({
        ...arg.params.oldState,
      })

      // empty init state
      arg.params = {
        oldState: {state1: 'state1'},
      }
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({
        ...arg.params.oldState,
      })

      // empty old state
      arg.params = {
        initState: {state2: 'state2'},
      }
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({
        ...arg.params.initState,
      })

      // non-conflict states
      arg.params = {
        initState: {state2: 'state2'},
        oldState: {state1: 'state1'},
      }
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({
        ...arg.params.initState,
        ...arg.params.oldState,
      })

      // conflict states
      arg.params = {
        initState: {state2: 'state2'},
        oldState: {state2: 'state3'},
      }
      await main(arg)
      expect(arg.setWalletState).toBeCalledWith({
        ...arg.params.initState,
        ...arg.params.oldState,
      })
    })

    it('should throw the not a function error if setWalletState is not a function', async function () {
      await expect(main({params: {}})).rejects.toThrow(/is not a function/)
    })
  })
})
