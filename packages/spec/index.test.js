// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import * as s from './index.js'

const {validate} = s

describe('@cfxjs/spec', function () {
  describe('epochTag', function () {
    it('should be able to validate the epoch tag', async function () {
      expect(validate(s.epochTag, 'latest_state')).toBeTruthy()
      expect(validate(s.epochTag, 'latest_mined')).toBeTruthy()
      expect(validate(s.epochTag, 'latest_confirmed')).toBeTruthy()
      expect(validate(s.epochTag, 'latest_checkpoint')).toBeTruthy()
      expect(validate(s.epochTag, 'earliest')).toBeTruthy()
      expect(validate(s.epochTag, null)).toBeTruthy()
      expect(validate(s.epochTag, undefined)).toBeTruthy()
      expect(validate(s.epochTag, '0x1')).toBeFalsy()
      expect(validate(s.epochTag, 1)).toBeFalsy()
    })
  })
})
