// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import * as db from './db.js'

const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
    },
    accounts: {
      doc: 'Accounts belong to this vault',
      many: true,
      ref: true,
      component: true,
    },
  },
  account: {
    hexAddress: {
      identity: true,
      doc: 'Account hex address',
    },
    vault: {
      ref: true,
      doc: 'Entity ID of vault',
    },
  },
}

describe('db', function () {
  describe('create db', function () {
    it('should return the get getby and create functions defined in schema', async function () {
      const conn = db.createdb(schema)
      expect(typeof conn.createVault === 'function').toBe(true)
      expect(typeof conn.getVault === 'function').toBe(true)
      expect(typeof conn.getVaultByType === 'function').toBe(true)
      expect(typeof conn.getVaultByData === 'function').toBe(true)

      expect(typeof conn.createAccount === 'function').toBe(true)
      expect(typeof conn.getAccount === 'function').toBe(true)
      expect(typeof conn.getAccountByVault === 'function').toBe(true)
      expect(typeof conn.getAccountByHexAddress === 'function').toBe(true)
    })
  })

  describe('create fn', function () {
    it('should create the data and return the right entity id', async function () {
      const conn = db.createdb(schema)
      const txReport = conn.createVault({type: 'a', data: 'b'})
      // the first entity in db has the entity id 1
      expect(txReport).toBe(1)
    })
  })

  describe('get by fn', function () {
    it('should get the right data with simple query', async function () {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b', accounts: [2]})
      conn.createAccount({
        vault: vaultId,
        hexAddress: '0x10000000000000000000000000000000000000000000000000',
      })

      let rst, vault
      rst = conn.getVaultByType('a')
      expect(Array.isArray(rst)).toBe(true)
      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(1)

      rst = conn.getVaultByData('b')
      expect(Array.isArray(rst)).toBe(true)
      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(1)
    })

    it('should return a empty array if found no data', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      let rst
      rst = conn.getVaultByType('c')
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(0)
    })
  })

  describe('get fn', function () {
    it('should get the right data', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})
      let rst, vault
      rst = conn.getVault({type: 'a'})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(2)

      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(1)

      vault = rst[1]
      expect(vault.data).toBe('c')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(2)

      // default to $and logic
      rst = conn.getVault({type: 'a', data: 'b'})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(1)

      // $or logic
      rst = conn.getVault({type: 'a', data: 'b', $or: true})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(2)
    })
  })

  describe('get one fn', function () {
    it('should get the right data', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})
      let vault
      vault = conn.getOneVault({type: 'a'})
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(1)
    })
  })

  describe('get by id fn', function () {
    it('should return the right result', async function () {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b'})
      const vault = conn.getById(vaultId)
      expect(vault).toBeDefined()
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(vaultId)
      expect(conn.getById(2)).toBeNull()
    })
  })

  describe('delete one fn', function () {
    it('should remove the right data', async function () {
      const conn = db.createdb(schema)
      const vault1Id = conn.createVault({type: 'a', data: 'b', accounts: [3]})
      conn.createVault({type: 'a', data: 'c'})
      conn.createAccount({
        vault: vault1Id,
        hexAddress: '0x10000000000000000000000000000000000000000000000000',
      })
      let vault
      expect(conn.getOneVault({data: 'b'}).accounts).toBeDefined()
      conn.deleteOneVault({data: 'b'})
      vault = conn.getOneVault({type: 'a'})
      expect(vault.data).toBe('c')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(2)
    })
  })

  describe('delete many fn', function () {
    it('should remove the right data', async function () {
      const conn = db.createdb(schema)

      conn.createVault({type: 'a', data: '1'})
      conn.createVault({type: 'a', data: '2'})
      conn.createVault({type: 'a', data: '3'})
      conn.createVault({type: 'a', data: '4'})
      conn.createVault({type: 'b', data: '5'})
      conn.createVault({type: 'b', data: '6'})

      expect(conn.getVault({type: 'a'}).length).toBe(4)
      expect(conn.getVault({type: 'b'}).length).toBe(2)

      expect(conn.deleteVault({type: 'a', data: '1'})).toBe(true)
      expect(conn.getVault({type: 'a'}).length).toBe(3)
      expect(conn.getVault({type: 'a', data: '1'}).length).toBe(0)

      expect(conn.deleteVault({type: 'a', data: '5', $or: true})).toBe(true)
      expect(conn.getVault({type: 'a'}).length).toBe(0)
      expect(conn.getVaultByData('5').length).toBe(0)
    })
  })

  describe('delete by id fn', function () {
    it('should remove the right data', async function () {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b', accounts: [2]})
      const accountId = conn.createAccount({hexAddress: 'a', vault: 1})
      expect(conn.getById(vaultId)).toBeDefined()
      expect(conn.getById(accountId)).toBeDefined()
      expect(conn.deleteById(vaultId)).toBe(true)
      expect(conn.getById(vaultId)).toBeNull()

      // vault has many accounts as component
      // retract a vault will retract all its accounts
      expect(conn.getById(accountId)).toBeNull()
    })
  })

  describe('update fn', function () {
    it('should update the right data in db', async function () {
      const conn = db.createdb(schema)

      conn.createVault({type: 'a', data: '1'})
      conn.createVault({type: 'a', data: '2'})
      conn.createVault({type: 'a', data: '3'})
      conn.createVault({type: 'a', data: '4'})
      conn.createVault({type: 'b', data: '5'})
      conn.createVault({type: 'b', data: '6'})

      expect(conn.getVault({type: 'a'}).length).toBe(4)
      expect(conn.getVault({type: 'b'}).length).toBe(2)

      expect(
        conn.updateVault({type: 'a', data: '1'}, {data: '2'})[0].data,
      ).toBe('2')

      expect(conn.getVault({type: 'a', data: '2'}).length).toBe(2)

      expect(
        conn.updateVault(
          {type: 'a', data: '6', $or: true},
          {type: 'b', data: '5'},
        ).length,
      ).toBe(5)

      expect(conn.getVault({type: 'b', data: '5'}).length).toBe(6)
    })
  })

  describe('update one fn', function () {
    it('should update the right data in db', async function () {
      const conn = db.createdb(schema)

      conn.createVault({type: 'a', data: '1'})
      conn.createVault({type: 'a', data: '2'})
      conn.createVault({type: 'b', data: '3'})

      expect(conn.getVault({type: 'a'}).length).toBe(2)
      expect(conn.getVault({type: 'b'}).length).toBe(1)

      expect(conn.updateOneVault({type: 'a'}, {type: 'b'}).data).toBe('1')
      expect(conn.getVault({type: 'b'}).length).toBe(2)
    })
  })

  describe('update by id fn', function () {
    it('should update the right data in db', async function () {
      const conn = db.createdb(schema)

      conn.createVault({type: 'a', data: '1'})
      conn.createVault({type: 'a', data: '2'})

      expect(conn.updateById(1, {data: '3'}).data).toBe('3')
      expect(conn.updateById(2, {data: '4'}).data).toBe('4')

      const vaults = conn.getVault({type: 'a'})

      expect(vaults.length).toBe(2)
      expect(vaults[0].eid).toBe(1)
      expect(vaults[0].data).toBe('3')
      expect(vaults[1].eid).toBe(2)
      expect(vaults[1].data).toBe('4')
    })
  })

  describe('Entity', function () {
    it('should have the right instance method', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b', accounts: [2]})
      conn.createAccount({hexAddress: 'c', vault: 1})

      const vault = conn.getOneVault({data: 'b'})

      expect(vault.eid).toBe(1)
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.get('data')).toBe('b')
      expect(vault.get('type')).toBe('a')
      expect(vault.modelName()).toBe('vault')
      expect(vault.attr__GT_key('a').toString()).toBe(':vault/a')
      expect(vault.attr__GT_key(':a').toString()).toBe(':a')
      expect(vault.attr__GT_key('id').toString()).toBe(':db/id')

      // TODO: this works in browser but not in node.js
      // const account = conn.getOneAccount({hexAddress: 'c'})
      // expect(account.vault.type).toBe('a')
      // expect(account.vault.data).toBe('b')
      // expect(vault.accounts[0].hexAddress).toBe('c')
    })
  })
})
