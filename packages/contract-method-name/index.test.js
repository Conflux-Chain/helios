import {expect, describe, beforeEach} from '@jest/globals'
import {getEthContractName, getCFXContractName} from './index.js'
let contractAddress = ''
let transactionData = ''
const fakeContractAddress = 'iamfakeaddress'
const fakeTransactionData = 'iamfaketx'
describe('contract-method-name', function () {
  describe('cfx', function () {
    beforeEach(() => {
      contractAddress = 'cfxtest:acgd1ex04h88ybdyxxdg45wjj0mrcwx1fak1snk3db'
      transactionData =
        '0x6057361d0000000000000000000000000000000000000000000000000000000000000064'
    })
    it('should return CFX method name', async function () {
      const res = await getCFXContractName(contractAddress, transactionData)
      expect(res).toHaveProperty('fullName', 'store(uint256 num)')
    })

    // when error happened
    it('should return empty object', async function () {
      const res = await getCFXContractName(
        fakeContractAddress,
        fakeTransactionData,
      )
      expect(res).toEqual({})
    })
  })

  describe('eth', function () {
    beforeEach(() => {
      transactionData =
        '0x6057361d000000000000000000000000000000000000000000000000000000000000022b'
    })
    it('should return ETH method name', async function () {
      const res = await getEthContractName(transactionData)
      expect(res).toHaveProperty('fullName', 'store(uint256)')
    })

    // when error happened
    it('should return empty object', async function () {
      const res = await getEthContractName(fakeTransactionData)
      expect(res).toEqual({})
    })
  })
})
