// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
// eslint-disable-next-line no-unused-vars
import waitForExpect from 'wait-for-expect'
import {init} from './index.js'

let params,get,set
describe('@cfxjs/cache-rpc', function () {
  beforeEach(() => {
    const cacheMethods = init()
    get = cacheMethods.get
    set = cacheMethods.set
    params = {
      req: {method: 'foo', params: ['bar']},
      res: {result: '0x1'},
      conf: {
        type: 'ttl',
        ttl: 10,
        key: ({params}) => `EPOCH${params[0]}`,
      },
    }
  })
  describe('init', function () {
    test('basic ttl cache', async () => {
      set(params)
      expect(get(params)).toBe(params.res.result)
      params.res.result = '0x2'
      expect(get(params)).toBe('0x1')
      await waitForExpect(() => expect(get(params)).toBe(undefined))
    })
    test('0x epoch cache', () => {
      params.conf = {
        type: 'epoch',
        key: ({params}) => `cfx_getAccount${params[0]}`,
      }
      params.req.method = 'cfx_getAccount'
      params.req.params = ['0xfoo', '0xbar']
      params.res.result = '0xaccountinfo'

      set(params)

      expect(get(params)).toBe(params.res.result)
    })
    test('tag epoch cache', () => {
      params.conf = {
        type: 'epoch',
        key: ({params}) => `cfx_getAccount${params[0]}`,
      }
      params.req.method = 'cfx_getAccount'
      params.req.params = ['0xfoo', 'latest_state']
      params.res.result = '0xaccountinfo'

      set(params)

      expect(get(params)).toBe(params.res.result)
    })
    test('beforeGet conf return false', () => {
      params.conf.beforeGet = jest.fn(() => false)
      set(params)
      expect(get(params)).toBeUndefined()
      expect(params.conf.beforeGet).toBeCalledWith(params.req)
    })
    test('beforeGet conf return true', () => {
      params.conf.beforeGet = jest.fn(() => true)

      set(params)
      expect(get(params)).toBe(params.res.result)
      expect(params.conf.beforeGet).toBeCalledWith(params.req)
    })
    test('afterGet conf', () => {
      params.conf.afterGet = jest.fn(() => 'foo')
      set(params)
      expect(get(params)).toBe('foo')
      expect(params.conf.afterGet).toBeCalledWith(params.req, params.res.result)
    })
    test('beforeSet return false', () => {
      params.conf.beforeSet = jest.fn(() => false)
      set(params)
      expect(params.conf.beforeSet).toBeCalledWith(params.req, params.res)
      expect(get(params)).toBeUndefined()
    })
    test('beforeSet return true', () => {
      params.conf.beforeSet = jest.fn(() => true)
      set(params)
      expect(params.conf.beforeSet).toBeCalledWith(params.req, params.res)
      expect(get(params)).toBe(params.res.result)
    })
    test('afterSet conf', () => {
      params.conf.afterSet = jest.fn(() => 'foo')
      set(params)
      expect(params.conf.afterSet).toBeCalledWith(set, params.req, params.res)
    })

    test('errors', () => {
      const {set} = init()
      let params = {
        req: {method: 'foo', params: ['bar']},
        res: {result: '0x1'},
        conf: {
          type: 'epoch',
          key: ({params}) => `cfx_getAccount${params[0]}`,
        },
      }
      expect(() => set(params)).toThrowError(
        'Invalid cache option, no epoch/block ref pos in @cfxjs/rpc-epoch-ref',
      )
    })
  })
})
