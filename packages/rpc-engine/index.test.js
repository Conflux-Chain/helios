import {expect, describe, it} from 'vitest'
import {defRpcEngine} from './index'

describe('RPCEngine', () => {
  it('dispatches through the graph after a rejected request', async () => {
    const {request} = defRpcEngine(
      {getOneNetwork: () => ({name: 'local', type: 'cfx', netId: 1})},
      {
        methods: [
          {
            NAME: 'wallet_echo',
            permissions: {external: ['popup'], locked: true},
            main: ({params}) => params.value,
          },
        ],
      },
    )

    const rejected = await request({
      id: 1,
      method: 'wallet_missing',
      _popup: true,
    })
    expect(rejected).toMatchObject({
      id: 1,
      jsonrpc: '2.0',
      error: {code: -32601},
    })

    for (const id of [2, 3]) {
      const res = await request({
        id,
        method: 'wallet_echo',
        _popup: true,
        params: {value: id},
      })
      expect(res).toEqual({id, jsonrpc: '2.0', result: id})
    }
  })
})
