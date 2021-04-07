// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {persist} from './persist-db-to-ext-storage.js'
import browser from 'webextension-polyfill'
import {EXT_STORAGE} from 'consts'

beforeEach(() => {
  browser.geckoProfiler.start.mockClear()
  browser.geckoProfiler.stop.mockClear()
})

describe('persist-db-to-ext-storage', function () {
  describe('persist', function () {
    it('should call the webextension storage.local.set api on new input data', async function () {
      await persist('foo')
      expect(browser.storage.local.set).not.toBeCalled()

      // 500ms debounce
      setTimeout(
        () =>
          expect(browser.storage.local.set).toBeCalledWith({
            [EXT_STORAGE]: 'foo',
          }),
        500,
      )
    })
  })
})
