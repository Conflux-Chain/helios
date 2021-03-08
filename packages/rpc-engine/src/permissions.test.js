import {defaultPermissions, format, getRpc, getWalletStore} from './permissions'

describe('permissions', function () {
  describe('format', function () {
    it('should return the specified permissions with the default permissions filled', async function () {
      expect(format()).toStrictEqual(defaultPermissions)
      expect(format({methods: ['cfx_mockRpc']})).toStrictEqual({
        ...defaultPermissions,
        methods: ['cfx_mockRpc'],
      })
      expect(format({store: {get: true}})).toStrictEqual({
        ...defaultPermissions,
        store: {...defaultPermissions.store, get: true},
      })
    })
  })

  describe('permissions check', function () {
    let rpcStore, walletStore

    beforeEach(function () {
      rpcStore = {
        cfx_mockRpc: {
          NAME: 'cfx_mockRpc',
          main: jest.fn(),
          permissions: format(),
        },
        cfx_mockRpc2: 'cfx_mockRpc2',
      }
      walletStore = {setState: jest.fn(), getState: jest.fn()}
    })

    describe('getRpc', function () {
      it("should not return the rpc method if it's not permitted'", async function () {
        expect(getRpc(rpcStore, 'cfx_mockRpc', 'cfx_mockRpc2')).toBe(false)
      })

      it("should return the rpc method if it's permitted'", function () {
        rpcStore.cfx_mockRpc.permissions.methods = ['cfx_mockRpc2']
        expect(getRpc(rpcStore, 'cfx_mockRpc', 'cfx_mockRpc2')).toBe(
          rpcStore.cfx_mockRpc2,
        )
      })
    })

    describe('getWalletStore', function () {
      it('should return the protectedStore based on permission', async function () {
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').getState,
        ).toBeUndefined()
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').setState,
        ).toBeUndefined()

        rpcStore.cfx_mockRpc.permissions.store.get = true
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').getState,
        ).toBeDefined()
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').setState,
        ).toBeUndefined()
        getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').getState(1)
        expect(walletStore.getState).toBeCalledWith(1)

        rpcStore.cfx_mockRpc.permissions.store.set = true
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').getState,
        ).toBeDefined()
        expect(
          getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').setState,
        ).toBeDefined()
        getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').getState(1)
        expect(walletStore.getState).toBeCalledWith(1)
        getWalletStore(rpcStore, walletStore, 'cfx_mockRpc').setState(2)
        expect(walletStore.setState).toBeCalledWith(2)
      })
    })
  })
})
