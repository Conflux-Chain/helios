// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './'
import {encrypt} from 'browser-passworder'

const PRIVATE_KEY =
  '0xf581242f2de1111638b9da336c283f177ca1e17cb3d6e3b09434161e26135992'
const PASSWORD = '11111111'
const MNEMONIC =
  'error mom brown point sun magnet armor fish urge business until plastic'
let input, vault

describe('wallet_createAccount', function () {
  describe('main', function () {
    describe('type=hd', function () {
      beforeAll(async function () {
        vault = {
          data: await encrypt(PASSWORD, MNEMONIC),
          type: 'hd',
          accounts: [],
        }
      })

      beforeEach(function () {
        input = {
          db: {
            createAccount: jest.fn(() => 1),
            getPassword: jest.fn(() => PASSWORD),
            getVaultById: jest.fn(),
          },
          params: {
            vaultId: 0,
          },
          Err: {InvalidParams: msg => new Error(msg)},
        }
      })

      it('should be able to create a hd account', async function () {
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).resolves.toBe(1)
        expect(input.db.getPassword).toBeCalled()
        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
            ethHexAddress: '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
            vault: 0,
            hdIndex: 0,
          }),
        )
      })

      it('should be able to create a hd account, with the already created account', async function () {
        input.db.getVaultById = jest.fn(() => ({
          ...vault,
          accounts: [
            {
              cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
              ethHexAddress: '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
              vault: 0,
              hdIndex: 0,
            },
          ],
        }))

        await main(input)
        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x168539313a4a03211ee03f5f9a6c149751fb4f44',
            ethHexAddress: '0xe68539313a4a03211ee03f5f9a6c149751fb4f44',
            vault: 0,
            hdIndex: 1,
          }),
        )
      })

      it('should be able to create a hd 0x1-prefixed account', async function () {
        input.db.getVaultById = jest.fn(() => vault)
        input.params.only0x1Prefixed = true

        await main(input)
        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x12c557579a8ca61f94f6c5260cb144414cfec184',
            ethHexAddress: '0x12c557579a8ca61f94f6c5260cb144414cfec184',
            vault: 0,
            hdIndex: 15,
          }),
        )
      })

      it('should be able to create a hd 0x1-prefixed account with already created accounts', async function () {
        input.db.getVaultById = jest.fn(() => ({
          ...vault,
          accounts: [
            {
              cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
              ethHexAddress: '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
              vault: 0,
              hdIndex: 0,
            },
            {
              cfxHexAddress: '0x12c557579a8ca61f94f6c5260cb144414cfec184',
              ethHexAddress: '0x12c557579a8ca61f94f6c5260cb144414cfec184',
              vault: 0,
              hdIndex: 15,
            },
          ],
        }))
        input.params.only0x1Prefixed = true

        await main(input)
        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x10d3db913a71d7d28476d6bf583b7f37c85f5491',
            ethHexAddress: '0x10d3db913a71d7d28476d6bf583b7f37c85f5491',
            hdIndex: 59,
            vault: 0,
          }),
        )
      })

      it('should be able to create a hd account with eth hd drivation path', async function () {
        input.params.hdPath = `m/44'/60'/0'/0`
        input.db.getVaultById = jest.fn(() => vault)
        await main(input)
        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x1de7fb621a141182bf6e65beabc6e8705cdff3d1',
            ethHexAddress: '0x1de7fb621a141182bf6e65beabc6e8705cdff3d1',
            vault: 0,
            hdIndex: 0,
          }),
        )
      })

      it('should be throw error with invalid hd path', async function () {
        input.params.hdPath = `foo`
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).rejects.toThrow('Invalid hdPath foo')
      })
    })

    describe('type=pk', function () {
      beforeAll(async function () {
        vault = {
          data: await encrypt(PASSWORD, PRIVATE_KEY),
          type: 'pk',
          accounts: [],
        }
      })

      beforeEach(function () {
        input = {
          db: {
            createAccount: jest.fn(() => 1),
            getPassword: jest.fn(() => PASSWORD),
            getVaultById: jest.fn(),
          },
          params: {
            vaultId: 0,
          },
          Err: {InvalidParams: msg => new Error(msg)},
        }
      })

      it('should be able to create account with given private key', async function () {
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).resolves.toBe(1)

        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
            ethHexAddress: '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
            vault: 0,
          }),
        )
      })
    })

    describe('type=pub', function () {
      beforeAll(async function () {
        vault = {
          type: 'pub',
          accounts: [],
        }
      })

      beforeEach(function () {
        input = {
          db: {
            createAccount: jest.fn(() => 1),
            getPassword: jest.fn(() => PASSWORD),
            getVaultById: jest.fn(),
          },
          params: {
            vaultId: 0,
          },
          Err: {InvalidParams: msg => new Error(msg)},
        }
      })

      it('should be able to create account with given private key', async function () {
        vault.data = await encrypt(
          PASSWORD,
          '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
        )
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).resolves.toBe(1)

        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
            ethHexAddress: '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
            vault: 0,
          }),
        )
      })

      it('should be able to create cfx only account with given address', async function () {
        vault.data = await encrypt(
          PASSWORD,
          '0x7b3d01a14c84181f4df3983ae68118e4bad48407',
        )
        vault.cfxOnly = true
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).resolves.toBe(1)

        expect(input.db.createAccount).toBeCalledWith(
          expect.objectContaining({
            cfxHexAddress: '0x1b3d01a14c84181f4df3983ae68118e4bad48407',
            vault: 0,
          }),
        )
      })
    })

    describe('error', function () {
      beforeAll(async function () {
        vault = {
          data: await encrypt(PASSWORD, PRIVATE_KEY),
          type: 'pk',
          accounts: [],
        }
      })

      beforeEach(function () {
        input = {
          db: {
            createAccount: jest.fn(() => 1),
            getPassword: jest.fn(() => PASSWORD),
            getVaultById: jest.fn(),
          },
          params: {
            vaultId: 0,
          },
          Err: {InvalidParams: msg => new Error(msg)},
        }
      })

      it('should throw invalid params error on given hdpath with none hd vault', async function () {
        input.params.hdPath = 'foo'
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).rejects.toThrow(
          "Don't support hdPath on none hd wallet",
        )
      })

      it('should throw invalid params error on given only0x1Prefixed with none hd vault', async function () {
        input.params.only0x1Prefixed = true
        input.db.getVaultById = jest.fn(() => vault)
        await expect(main(input)).rejects.toThrow(
          "Don't support only0x1Prefixed account on none hd wallet",
        )
      })

      it("should throw invalid vaultId params error there's no vault found", async function () {
        input.db.getVaultById = jest.fn()
        await expect(main(input)).rejects.toThrow('Invalid vault id 0')
      })
    })
  })
})
