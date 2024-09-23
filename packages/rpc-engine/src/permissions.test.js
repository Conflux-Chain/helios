import {expect, describe, it, vi, beforeEach} from 'vitest'
import {defaultPermissions, format, getRpc, getWalletDB} from './permissions'

describe('permissions', () => {
  describe('format', () => {
    it('should return the specified permissions with the default permissions filled', async () => {
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

  describe('permissions check', () => {
    let rpcStore, db

    beforeEach(() => {
      rpcStore = {
        cfx_mockRpc: {
          NAME: 'cfx_mockRpc',
          main: vi.fn(),
          permissions: {...format()},
        },
        cfx_mockRpc2: 'cfx_mockRpc2',
      }
      db = {getVault: vi.fn(), createVault: vi.fn()}
    })

    describe('getRpc', () => {
      it("should not return the rpc method if it's not permitted'", async () => {
        expect(getRpc(rpcStore, 'cfx_mockRpc', 'cfx_mockRpc2')).toBe(false)
      })

      it("should return the rpc method if it's permitted'", () => {
        rpcStore.cfx_mockRpc.permissions.methods = ['cfx_mockRpc2']
        expect(getRpc(rpcStore, 'cfx_mockRpc', 'cfx_mockRpc2')).toBe(
          rpcStore.cfx_mockRpc2,
        )
      })
    })

    describe('getWalletDB', () => {
      it('should return the protectedStore based on permission', async () => {
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
