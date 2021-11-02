import {expect, describe, afterEach} from '@jest/globals'
import nock from 'nock'
import {
  getCFXScanDomain,
  getCFXContractMethodSignature,
  eip777AbiSignatures,
} from './cfx-name'
import {Conflux} from 'js-conflux-sdk'
import {ABI as abi} from '@fluent-wallet/contract-abis/777.js'

describe('CFX Name', () => {
  describe('getCFXScanDomain', () => {
    it('should return testnet url', () => {
      expect(getCFXScanDomain('CFX_TESTNET')).toEqual(
        'https://testnet.confluxscan.io',
      )
    })

    it('should return mainnet url', () => {
      expect(getCFXScanDomain('CFX_MAINNET')).toEqual('https://confluxscan.io')
    })
  })
  describe('eip777AbiSignatures', () => {
    it('test eip777AbiSignatures', () => {
      const contract = new Conflux().Contract({abi})
      const signatures = []
      abi.forEach(item => {
        signatures.push(contract[item.name].signature)
      })
      expect(eip777AbiSignatures).toEqual(signatures)
    })
  })
  describe('getCFXContractMethodSignature', () => {
    afterEach(() => {
      nock.cleanAll()
    })
    it('should return name of store function', async () => {
      nock('https://testnet.confluxscan.io/v1/contract')
        .get('/cfxtest:acgd1ex04h88ybdyxxdg45wjj0mrcwx1fak1snk3db?fields=abi')
        .reply(200, {
          address:
            'CFXTEST:TYPE.CONTRACT:ACGD1EX04H88YBDYXXDG45WJJ0MRCWX1FAK1SNK3DB',
          balance: '0',
          stakingBalance: '0',
          collateralForStorage: '0',
          accumulatedInterestReturn: '0',
          nonce: '1',
          admin: 'CFXTEST:TYPE.USER:AAPKDET2SRR4ZW45E6SUMWUCTS0EDDV292V2WM4SPH',
          codeHash:
            '0xff1ff69c9c255b058da0ff59438b911af324471f35571c63eb3e410672d141ae',
          epochNumber: 36021753,
          from: 'CFXTEST:TYPE.USER:AAPKDET2SRR4ZW45E6SUMWUCTS0EDDV292V2WM4SPH',
          transactionHash:
            '0xcfe2c66ab583ba5ee4e04543df0f9ea83e74ce4526776bae48b154258cba6279',
          name: 'testForStore',
          abi: '[{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
          isRegistered: true,
        })
      const res = await getCFXContractMethodSignature(
        'cfxtest:acgd1ex04h88ybdyxxdg45wjj0mrcwx1fak1snk3db',
        '0x6057361d0000000000000000000000000000000000000000000000000000000000000064',
        'CFX_TESTNET',
      )
      expect(res).toHaveProperty('fullName', 'store(uint256 num)')
    })
    it('should return name of transfer function', async () => {
      const contract = new Conflux().Contract({abi})
      const transferData = contract.transfer(
        'cfx:aamysddjren1zfp36agsek5fxt2w0st8feps3297ek',
        111,
      )
      const res = await getCFXContractMethodSignature(
        'cfxtest:acgd1ex04h88ybdyxxdg45wjj0mrcwx1fak1snk3db',
        transferData.data,
        'CFX_TESTNET',
      )
      expect(res).toHaveProperty(
        'fullName',
        'transfer(address recipient, uint256 amount)',
      )
      expect(res).toHaveProperty('object', {
        recipient: '0x15470c6869177a9599e00ce227659bf12b39fe29',
        amount: 111n,
      })
    })
    it('should return empty object', async () => {
      nock('https://testnet.confluxscan.io/v1/contract')
        .get('/some-wrong-address?fields=abi')
        .reply(500)
      const res = await getCFXContractMethodSignature(
        'some-wrong-address',
        '0x6057361d0000000000000000000000000000000000000000000000000000000000000064',
        'CFX_TESTNET',
      )
      expect(res).toEqual({})
    })
  })
})
