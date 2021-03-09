import {defRpcEngine} from './index'

describe('RPCEngine', function () {
  describe('defRpcEngine', function () {
    const mockStore = {setState: jest.fn(), getState: jest.fn()}
    const mockOpts = {
      methods: [
        {
          main: jest.fn(),
          NAME: 'cfx_mockRpc',
          permissions: {
            methods: [],
          },
        },
      ],
    }

    it('should return the request method', async function () {
      const {request} = defRpcEngine(mockStore, mockOpts)
      const res = await request({
        method: 'cfx_mockRpc',
        params: {mockParams: 'mockParams'},
      })
      expect(res).toStrictEqual({jsonrpc: '2.0', id: 2, result: '0x1'})
    })
  })
})
