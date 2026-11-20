import {expect, describe, it, beforeEach, vi} from 'vitest'
import {persist} from './persist-db-to-ext-storage.js'
import browser from 'webextension-polyfill'
import {EXT_STORAGE} from '@fluent-wallet/consts'

beforeEach(() => {
  browser.storage.local.set.mockClear()
})

describe('persist-db-to-ext-storage', () => {
  describe('persist', () => {
    it('writes only the latest channel value to storage after debouncing', async () => {
      await persist('first')
      await persist('latest')
      expect(browser.storage.local.set).not.toHaveBeenCalled()

      await vi.waitFor(
        () =>
          expect(browser.storage.local.set).toHaveBeenCalledWith({
            [EXT_STORAGE]: 'latest',
          }),
        {timeout: 2000},
      )
      expect(browser.storage.local.set).toHaveBeenCalledTimes(1)
    })
  })
})
