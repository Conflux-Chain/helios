// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {defRpcEngine} from '@cfxjs/rpc-engine'
import {createdb} from '@cfxjs/db'
import {rpcEngineOpts} from './rpc-engine-opts'
import SCHEMA from './db-schema'

const password = '12345678'

let request, db
const setupdb = () => {
  db = createdb(SCHEMA)
  request = defRpcEngine(db, rpcEngineOpts).request
}

// eslint-disable-next-line
describe.skip('accounts integration test', function () {
  describe('vault', function () {
    describe('import', function () {
      it('should be able to import a mnemonic vault', async function () {
        setupdb()

        const {result: mnemonic} = await request({
          method: 'wallet_generateMnemonic',
          params: {entropy: 'abc'},
        })

        await expect(
          request({
            method: 'wallet_importMnemonic',
            params: {mnemonic, password},
          }),
        ).resolves.toHaveProperty('result', '0x1')

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pk').length).toBe(0)
        expect(db.getVaultByType('hd').length).toBe(1)
      })

      it('should be able to import a private key vault', async function () {
        setupdb()

        const {result: pk} = await request({
          method: 'wallet_generatePrivateKey',
          params: {entropy: 'abc'},
        })

        await expect(
          request({
            method: 'wallet_importPrivateKey',
            params: {privateKey: pk, password},
          }),
        ).resolves.toHaveProperty('result', '0x1')

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pk').length).toBe(1)
        expect(db.getVaultByType('hd').length).toBe(0)
      })

      it('should be able to import a address vault', async function () {
        setupdb()

        await expect(
          request({
            method: 'wallet_importAddress',
            params: {
              address: 'cfx:aamwwx800rcw63n42kbehesuukjdjcnuaafa2ucfuw',
              password,
            },
          }),
        ).resolves.toHaveProperty('result', '0x1')

        expect(db.getVault().length).toBe(1)
        expect(db.getVaultByType('pub').length).toBe(1)
      })
    })
  })
})
