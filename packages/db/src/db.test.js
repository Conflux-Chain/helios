import {expect, describe, it, test} from 'vitest'
import * as db from './db.js'

/* eslint-disable testing-library/prefer-screen-queries */
const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
    },
    ddata: {
      doc: 'Decrypted vault data',
      persist: false,
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

describe('db', () => {
  describe('create db', () => {
    it('should return the get getby and create functions defined in schema', async () => {
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

  describe('create fn', () => {
    it('should create the data and return the right entity id', async () => {
      const conn = db.createdb(schema)
      const txReport = conn.createVault({type: 'a', data: 'b'})
      // the first entity in the dbmeta/version
      // the second entity in db has the entity id 2
      expect(txReport).toBe(2)
    })
  })

  describe('transact fn', () => {
    it('should insert the right entity', async () => {
      const conn = db.createdb(schema)
      conn.t([
        {eid: -1, vault: {data: 1, type: 'foo'}},
        {account: {hexAddress: '0xfoo', vault: -1}},
      ])
      expect(conn.getAccount().length).toBe(1)
      expect(conn.getAccount()[0].hexAddress).toBe('0xfoo')
      expect(conn.getAccount()[0].vault.data).toBe(1)
      expect(conn.getAccount()[0].vault.type).toBe('foo')
    })

    it('should insert the right entity with tmpid from tmpid fn', async () => {
      const conn = db.createdb(schema)
      const tmpid = conn.tmpid()
      conn.t([
        {eid: tmpid, vault: {data: 1, type: 'foo'}},
        {account: {hexAddress: '0xfoo', vault: tmpid}},
      ])
      expect(conn.getAccount().length).toBe(1)
      expect(conn.getAccount()[0].hexAddress).toBe('0xfoo')
      expect(conn.getAccount()[0].vault.data).toBe(1)
      expect(conn.getAccount()[0].vault.type).toBe('foo')
    })

    it('should insert the right entity with lookup ref', async () => {
      const conn = db.createdb({
        vault: {name: {identity: true}},
        addr: {hex: {identity: true}, vault: {ref: true}},
      })
      conn.t({vault: {name: 'a'}})

      // {vault: {name: 'a'}} is a lookup-ref to look up vault entity, as the
      // name of vault is set to identity in schema
      conn.t({addr: {hex: 'foo', vault: {vault: {name: 'a'}}}})
      expect(conn.getAddr()[0].vault.name).toBe('a')
    })

    it('should insert the right entity with nested components', async () => {
      const conn = db.createdb({
        country: {
          cites: {ref: 'city', many: true, component: true},
          name: {doc: 'country name'},
        },
        city: {name: {doc: 'city name'}, country: {ref: true}},
      })
      conn.t([
        {
          eid: -1,
          country: {
            name: 'china',
            cites: [{city: {name: 'beijing', country: -1}}],
          },
        },
      ])
      expect(conn.getCountry()[0].cites[0].name).toBe('beijing')
      expect(conn.getCountry()[0].cites[0].country.name).toBe('china')
    })

    test("inidcating that db can't do two way bind automatically on entities with same ref/component", async () => {
      const conn = db.createdb({
        country: {
          cites: {ref: 'city', many: true, component: true},
          name: {doc: 'country name'},
        },
        city: {name: {doc: 'city name'}, country: {ref: true}},
      })
      conn.t([
        {eid: -1, country: {name: 'china', cites: [{city: {name: 'beijing'}}]}},
      ])
      expect(conn.getCountry()[0].cites[0].name).toBe('beijing')
      // NOTE: the db component/ref function can't do two-way bind
      expect(conn.getCountry()[0].cites[0].country).toBe(null)
    })
  })

  describe('get by fn', () => {
    it('should get the right data with simple query', async () => {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b'})
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
      expect(vault.eid).toBe(2)

      rst = conn.getVaultByData('b')
      expect(Array.isArray(rst)).toBe(true)
      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(2)
    })

    it('should return a empty array if found no data', async () => {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      let rst
      rst = conn.getVaultByType('c')
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(0)
    })
  })

  describe('get fn', () => {
    it('should get the right data', async () => {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})

      let rst, vault
      rst = conn.getVault({eid: 2})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(1)
      expect(rst[0].data).toBe('b')

      rst = conn.getVault({type: 'a'})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(2)
      expect(conn.getVault().length).toBe(2)

      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(2)

      vault = rst[1]
      expect(vault.data).toBe('c')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(3)

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

  describe('get one fn', () => {
    it('should get the right data', async () => {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})
      let vault
      vault = conn.getOneVault({type: 'a'})
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(2)
    })
  })

  describe('get by id fn', () => {
    it('should return the right result', async () => {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b'})
      const vault = conn.getVaultById(vaultId)
      expect(vault).toBeDefined()
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(vaultId)
    })
  })

  describe('delete one fn', () => {
    it('should remove the right data', async () => {
      const conn = db.createdb(schema)
      const vault1Id = conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})
      conn.createAccount({
        vault: vault1Id,
        hexAddress: '0x10000000000000000000000000000000000000000000000000',
      })
      let vault
      expect(conn.getOneVault({data: 'b'})).toBeDefined()
      conn.deleteOneVault({data: 'b'})
      vault = conn.getOneVault({type: 'a'})
      expect(vault.data).toBe('c')
      expect(vault.type).toBe('a')
      expect(vault.eid).toBe(3)
    })
  })

  describe('delete many fn', () => {
    it('should remove the right data', async () => {
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
      expect(conn.deleteVault()).toBe(true)
      expect(conn.getVault().length).toBe(0)
    })
  })

  describe('delete by id fn', () => {
    it('should remove the right data', async () => {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b'})
      const accountId = conn.createAccount({hexAddress: 'a', vault: 2})
      expect(conn.getVaultById(vaultId)).toBeDefined()
      expect(conn.getAccountById(accountId)).toBeDefined()
      expect(conn.deleteVaultById(vaultId)).toBe(true)
      expect(conn.getVaultById(vaultId)).toBeNull()

      // vault has many accounts as component
      // retract a vault will retract all its accounts
      expect(conn.getAccountById(accountId).vault).toBeNull()
    })
  })

  describe('update fn', () => {
    it('should update the right data in db', async () => {
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

      expect(conn.updateVault(null, {type: 'a'}).length).toBe(6)
      expect(conn.getVault({type: 'a'}).length).toBe(6)
    })
  })

  describe('update one fn', () => {
    it('should update the right data in db', async () => {
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

  describe('Entity', () => {
    it('should have the right instance method', async () => {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createAccount({hexAddress: 'c', vault: 2})

      const vault = conn.getOneVault({data: 'b'})

      expect(vault.eid).toBe(2)
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.get('data')).toBe('b')
      expect(vault.get('type')).toBe('a')
      expect(vault.modelName()).toBe('vault')
      expect(vault.attrToKey('a').toString()).toBe(':vault/a')
      expect(vault.attrToKey(':a').toString()).toBe(':a')

      const account = conn.getOneAccount({hexAddress: 'c'})
      expect(account.vault.type).toBe('a')
      expect(account.vault.data).toBe('b')
    })
  })

  describe('persist', () => {
    it('should be able to persist and restore the data', async () => {
      const fakeLocalStorage = {
        storage: {},
        setItem(k, v) {
          fakeLocalStorage.storage[k] = v
        },
        getItem(k) {
          return fakeLocalStorage.storage[k]
        },
      }

      let conn = db.createdb(schema, d => fakeLocalStorage.setItem('dsdata', d))
      conn.createVault({type: 'a', data: '1'})
      conn.createVault({type: 'a', data: '2'})
      conn.createVault({type: 'a', data: '3'})
      conn.createVault({type: 'a', data: '4'})
      expect(conn.getVaultByType('a').length).toBe(4)
      expect(conn.getVaultByData('1').length).toBe(1)

      conn = db.createdb(
        schema,
        d => fakeLocalStorage.setItem('dsdata', d),
        fakeLocalStorage.getItem('dsdata'),
      )
      conn.createVault({type: 'a', data: '1', ddata: '11'})

      // data with persist: false should be only apperare once in the schema section
      expect(
        fakeLocalStorage.storage.dsdata.match(/:vault\/ddata/).length,
      ).toBe(1)
      conn.createVault({type: 'a', data: '2'})
      conn.createVault({type: 'a', data: '3'})
      conn.createVault({type: 'a', data: '4'})
      expect(conn.getVaultByType('a').length).toBe(8)
      expect(conn.getVaultByData('1').length).toBe(2)
    })
  })
})
