import {expect, describe} from '@jest/globals'

import {getStorageItem, setStorageItem} from './storage-helper'

describe('storage-helper', function () {
  it('should return tesValue', function () {
    setStorageItem('testKey', 'testValue')
    const res = getStorageItem('testKey')
    expect(res).toEqual('testValue')
  })

  it('should return undefined', function () {
    const res = getStorageItem(Math.random().toString())
    expect(res).toBeUndefined()
  })
})
