import {expect, describe, it} from 'vitest'
import getAllRpcs from './get-all'

describe('getAllRpcs', () => {
  it('should return all rpc info', async () => {
    const rpcs = await getAllRpcs(new URL('../../rpcs', import.meta.url))
    expect(rpcs.length > 0).toBe(true)
    expect(typeof rpcs[0].packageJSON.name).toBe('string')
  })
})
