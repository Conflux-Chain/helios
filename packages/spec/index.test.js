import {expect, describe, it} from 'vitest'
import * as s from './index.js'

const {validate} = s

describe('@cfxjs/spec', () => {
  describe('epochTag', () => {
    it('should be able to validate the epoch tag', async () => {
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
