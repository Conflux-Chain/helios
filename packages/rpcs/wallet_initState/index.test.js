import {main, NAME} from './'

describe('wallet_initState', () => {
  describe('NAME', function () {
    it('should be right', async function () {
      expect(NAME).toBe('wallet_initState')
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
