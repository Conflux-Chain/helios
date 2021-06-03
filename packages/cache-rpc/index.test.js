// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {init} from './index.js'

let params
const {get, set} = init()
describe('@cfxjs/cache-rpc', function () {
  describe('init', function () {
    // eslint-disable-next-line jest/no-done-callback
    test('basic ttl cache', done => {
      params = {
        req: {method: 'foo', params: ['bar']},
        res: {result: '0x1'},
        conf: {
          type: 'ttl',
          ttl: 10,
          key: ({params}) => `EPOCH${params[0]}`,
        },
      }
      set(params)

      expect(get(params)).toBe(params.res.result)
      params.res.result = '0x2'
      expect(get(params)).toBe('0x1')
      setTimeout(() => {
        expect(get(params)).toBe(undefined)
        done()
      }, 20)
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
