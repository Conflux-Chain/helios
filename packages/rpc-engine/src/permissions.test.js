// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {defaultPermissions, format, getRpc, getWalletDB} from './permissions'

describe('permissions', function () {
  describe('format', function () {
    it('should return the specified permissions with the default permissions filled', async function () {
      expect(format()).toStrictEqual(defaultPermissions)
      expect(format({methods: ['cfx_mockRpc']})).toStrictEqual({
        ...defaultPermissions,
        methods: ['cfx_mockRpc'],
      })
      expect(format({store: {read: true}})).toStrictEqual({
        ...defaultPermissions,
        store: {...defaultPermissions.store, read: true},
      })
    })
  })

  describe('permissions check', function () {
    let rpcStore, db

    beforeEach(function () {
      rpcStore = {
        cfx_mockRpc: {
          NAME: 'cfx_mockRpc',
          main: jest.fn(),
          permissions: {...format()},
        },
        cfx_mockRpc2: 'cfx_mockRpc2',
      }
      db = {getVault: jest.fn(), createVault: jest.fn()}
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

    describe('getWalletDB', function () {
      it('should return the protectedStore based on permission', async function () {
        expect(() => getWalletDB(rpcStore, db, 'cfx_mockRpc').getVault).toThrow(
          'No permission to call db method getVault in cfx_mockRpc',
        )
        expect(
          () => getWalletDB(rpcStore, db, 'cfx_mockRpc').createVault,
        ).toThrow('No permission to call db method createVault in cfx_mockRpc')

        rpcStore.cfx_mockRpc.permissions.db = ['getVault']
        expect(
          () => getWalletDB(rpcStore, db, 'cfx_mockRpc').getVault,
        ).toBeDefined()
        expect(
          () => getWalletDB(rpcStore, db, 'cfx_mockRpc').createVault,
        ).toThrow('No permission to call db method createVault in cfx_mockRpc')
        getWalletDB(rpcStore, db, 'cfx_mockRpc').getVault(1)
        expect(db.getVault).toBeCalledWith(1)

        rpcStore.cfx_mockRpc.permissions.db = ['getVault', 'createVault']
        expect(
          () => getWalletDB(rpcStore, db, 'cfx_mockRpc').getVault,
        ).toBeDefined()
        expect(
          () => getWalletDB(rpcStore, db, 'cfx_mockRpc').createVault,
        ).toBeDefined()
        getWalletDB(rpcStore, db, 'cfx_mockRpc').getVault(1)
        expect(db.getVault).toBeCalledWith(1)
        getWalletDB(rpcStore, db, 'cfx_mockRpc').createVault(2)
        expect(db.createVault).toBeCalledWith(2)
      })
    })
  })
})
