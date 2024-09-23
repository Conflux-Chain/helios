import {expect, describe, it, vi} from 'vitest'
import {defRpcEngine} from './index'

// eslint-disable-next-line
describe.skip('RPCEngine', () => {
  describe('defRpcEngine', () => {
    const mockStore = {setState: vi.fn(), getState: vi.fn()}
    const mockOpts = {
      methods: [
        {
          main: vi.fn().mockResolvedValue(),
          NAME: 'cfx_mockRpc',
          permissions: {
            methods: [],
          },
        },
      ],
    }

    it('should return the request method', async () => {
      const {request} = defRpcEngine(mockStore, mockOpts)
      const res = await request({
        method: 'cfx_mockRpc',
        params: {mockParams: 'mockParams'},
      })
      expect(res.jsonrpc).toBe('2.0')
      expect(res.result).toBe('0x1')
    })
  })
})
