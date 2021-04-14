// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import getAllRpcs from './'

describe('getAllRpcs', function () {
  it('should return all rpc info', async function () {
    const rpcs = await getAllRpcs(new URL('../rpcs', import.meta.url))
    expect(rpcs.length > 0).toBe(true)
    expect(typeof rpcs[0].packageJSON.name).toBe('string')
  })
})
