import nock from 'nock'
import {expect, describe, afterEach} from '@jest/globals'
import {ETH_ENDPOINT} from './constance'
import {
  getETHEndpoint,
  geTextSignature,
  getEthContractMethodSignature,
} from './eth-name'
describe('ETH Name', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  describe('getETHEndpoint', () => {
    it('should return ETH ENDPOINT', () => {
      expect(getETHEndpoint('Mainnet')).toEqual(ETH_ENDPOINT['Mainnet'])
      expect(getETHEndpoint('Ropsten')).toEqual(ETH_ENDPOINT['Ropsten'])
      expect(getETHEndpoint('Rinkeby')).toEqual(ETH_ENDPOINT['Rinkeby'])
      expect(getETHEndpoint('Kovan')).toEqual(ETH_ENDPOINT['Kovan'])
      expect(getETHEndpoint('Goerli')).toEqual(ETH_ENDPOINT['Goerli'])
    })
    it('should return null', () => {
      expect(getETHEndpoint('some net')).toBeNull()
    })
  })
  describe('geTextSignature', () => {
    it('should return null when got wrong prefix', async () => {
      const res = await geTextSignature('some error prefix')
      expect(res).toEqual(null)
    })
    it('should return null when request got wrong data', async () => {
      nock('https://www.4byte.directory/api/v1')
        .get('/signatures/?hex_signature=0x6057361d')
        .reply(500)
      const res = await geTextSignature(
        '0x6057361d0000000000000000000000000000000000000000000000000000000000000064',
      )
      expect(res).toEqual(null)
    })

    it('should return text_signature', async () => {
      nock('https://www.4byte.directory/api/v1')
        .get('/signatures/?hex_signature=0x6057361d')
        .reply(200, {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 12405,
              created_at: '2018-04-11T16:26:08.661251Z',
              text_signature: 'store(uint256)',
              hex_signature: '0x6057361d',
              bytes_signature: '`W6\u001d',
            },
          ],
        })
      const res = await geTextSignature('0x6057361d')
      expect(res).toBe('store(uint256)')
    })
  })
  describe('getEthContractMethodSignature', () => {
    it('should return eth contract method name', async () => {
      nock('https://www.4byte.directory/api/v1')
        .get('/signatures/?hex_signature=0x6057361d')
        .reply(200, {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 12405,
              created_at: '2018-04-11T16:26:08.661251Z',
              text_signature: 'store(uint256)',
              hex_signature: '0x6057361d',
              bytes_signature: '`W6\u001d',
            },
          ],
        })
      const res = await getEthContractMethodSignature(
        '0x6057361d000000000000000000000000000000000000000000000000000000000000022b',
        null,
        'Ropsten',
      )
      expect(res).toHaveProperty('fullName', 'store(uint256)')
    })

    // it('should return empty object', async function () {
    //   nock('https://www.4byte.directory/api/v1')
    //     .get('/signatures/?hex_signature=0x6057361d')
    //     .reply(500)
    //   const res = await getEthContractMethodSignature(
    //     '0x6057361d000000000000000000000000000000000000000000000000000000000000022b',
    //     null,
    //     'Ropsten',
    //   )
    //   expect(res).toEqual({})
    // })
  })
})
