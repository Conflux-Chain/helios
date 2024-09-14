import {expect, describe, it, beforeEach} from 'vitest'
import {persist} from './persist-db-to-ext-storage.js'
import browser from 'webextension-polyfill'
import {EXT_STORAGE} from '@fluent-wallet/consts'

beforeEach(() => {
  browser.geckoProfiler.start.mockClear()
  browser.geckoProfiler.stop.mockClear()
})

describe('persist-db-to-ext-storage', () => {
  describe('persist', () => {
    it('should call the webextension storage.local.set api on new input data', async () => {
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
