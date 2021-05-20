// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {encode} from './'

describe('base32', function () {
  describe('encode', function () {
    it('should return the right encode result', async function () {
      expect(encode('cfx', '1d54a7c1d8634bb589f24bb7f05a5554b36f9618')).toBe(
        'cfx:bafeahabajgdeaafjkaceaahaafafffeadgakgbjwphz8r24',
      )
    })
  })
})
