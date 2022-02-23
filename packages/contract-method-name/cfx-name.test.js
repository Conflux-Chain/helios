import {expect, describe, afterEach} from '@jest/globals'
import nock from 'nock'
import {getCFXScanDomain, getCFXContractMethodSignature} from './cfx-name'
import {Interface} from '@ethersproject/abi'
import {iface} from '@fluent-wallet/contract-abis/777.js'
import {decode} from '@fluent-wallet/base32-address'

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
  describe('getCFXScanDomain', () => {
    it('should return testnet url', () => {
      expect(getCFXScanDomain('1')).toEqual('https://testnet.confluxscan.io')
    })

    it('should return mainnet url', () => {
      expect(getCFXScanDomain('1029')).toEqual('https://confluxscan.io')
    })
  })

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
      nock('https://testnet.confluxscan.io/v1/contract')
        .get(`/${contractAddress}?fields=abi`)
        .reply(200, {
          abi,
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

    it('should return empty object when input wrong address', async () => {
      nock('https://testnet.confluxscan.io/v1/contract')
        .get('/some-wrong-address?fields=abi')
        .reply(500)

      const err = await getError(() => {
        return getCFXContractMethodSignature(
          'some-wrong-address',
          erc20TransferData,
          1,
        )
      })
      expect(err).toEqual(new Error('inValidate base32 address'))
    })
    // it('should return empty object when input wrong transaction data', async () => {
    //   const res = await getCFXContractMethodSignature(
    //     contractAddress,
    //     'some-wrong-data',
    //     1,
    //   )
    //   expect(res).toEqual({})
    // })
  })
})
