import {expect, describe, afterEach} from '@jest/globals'
import nock from 'nock'
import {getCFXContractMethodSignature} from './cfx-name'
import {Interface} from '@ethersproject/abi'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode} from '@fluent-wallet/base32-address'
import {getURL} from '@fluent-wallet/confluxscan-api/utils.js'

const userBase32Address = 'cfxtest:aaktk1zbvj0snrxuc1m60deh1fh0ka862e2b78mnvs'
const contractAddress = 'cfxtest:acgd1ex04h88ybdyxxdg45wjj0mrcwx1fak1snk3db'
const userHexAddress = decode(userBase32Address).hexAddress

const getError = async call => {
  try {
    await call()
    throw new Error('NoErrorThrownError')
  } catch (error) {
    return error
  }
}

describe('CFX Name', () => {
  describe('getCFXContractMethodSignature', () => {
    afterEach(() => {
      nock.cleanAll()
    })
    const erc20TransferData = iface.encodeFunctionData('transfer', [
      userHexAddress,
      '0x1',
    ])
    it('should return name of store function', async () => {
      const abi =
        '[{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
      const transactionData = new Interface(JSON.parse(abi)).encodeFunctionData(
        'store',
        ['0x1'],
      )
      nock(getURL(1)).get(/.*/).reply(200, {
        code: 0,
        data: abi,
      })

      const res = await getCFXContractMethodSignature(
        contractAddress,
        transactionData,
        1,
      )
      expect(res).toHaveProperty('signature', 'store(uint256)')
    })

    it('should return eip777 function name', async () => {
      const res = await getCFXContractMethodSignature(
        contractAddress,
        erc20TransferData,
        1,
      )
      expect(res).toHaveProperty('signature', 'transfer(address,uint256)')
      expect(res).toHaveProperty('name', 'transfer')
    })

    it('should return to address', async () => {
      const res = await getCFXContractMethodSignature(
        contractAddress,
        erc20TransferData,
        1,
      )
      expect(res).toHaveProperty('args')
      expect(res.args).toContain(userBase32Address)
    })

    it('should throw error when got wrong address', async () => {
      nock(getURL(1))
        .get(/.*/)
        .reply(200, {
          code: 510,
          message:
            'Invalid address parameter [address] with value [some-wrong-address].',
          data: {
            address: 'some-wrong-address',
          },
        })

      await expect(
        getError(() => {
          return getCFXContractMethodSignature(
            'some-wrong-address',
            erc20TransferData,
            1,
          )
        }),
      ).resolves.toEqual(new Error('invalid base32 address'))
    })

    it('should throw error when got wrong transaction data', async () => {
      const abi =
        '[{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
      nock(getURL(1)).get(/.*/).reply(200, {
        code: 0,
        data: abi,
      })

      await expect(
        getError(() => {
          return getCFXContractMethodSignature(
            contractAddress,
            'some-wrong-data',
            1,
          )
        }),
      ).resolves.toEqual(new Error('failed to parse transaction data'))
    })
  })
})
