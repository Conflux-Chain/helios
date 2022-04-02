import nock from 'nock'
import {expect, describe, afterEach} from '@jest/globals'
import {
  geTextSignature,
  getEthMethodData,
  getEthContractMethodSignature,
} from './eth-name'

const getError = async call => {
  try {
    await call()
    throw new Error('NoErrorThrownError')
  } catch (error) {
    return error
  }
}

describe('ETH Name', () => {
  afterEach(() => {
    nock.cleanAll()
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
  describe('getEthMethodData', () => {
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
      const res = await getEthMethodData(
        '0x6057361d000000000000000000000000000000000000000000000000000000000000022b',
        null,
        '3',
      )
      expect(res).toHaveProperty('fullName', 'store(uint256)')
    })
    it('should throw error', async function () {
      nock('https://www.4byte.directory/api/v1')
        .get('/signatures/?hex_signature=0x6057361d')
        .reply(500)
      const err = await getError(() => {
        return getEthMethodData(
          '0x6057361d000000000000000000000000000000000000000000000000000000000000022b',
          null,
          '3',
        )
      })
      expect(err).toEqual(new Error('failed to get method data'))
    })
  })

  describe('getEthContractMethodSignature', () => {
    it('should return token data', () => {
      const tokenData = getEthContractMethodSignature(
        '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
      )
      const {name, args} = tokenData
      expect(name).toStrictEqual('transfer')
      const to = args[0]
      const value = args[1]
      expect(to).toStrictEqual('0x2f318C334780961FB129D2a6c30D0763d9a5C970')
      expect(value._hex).toStrictEqual('0x3a98')
    })
  })
})
