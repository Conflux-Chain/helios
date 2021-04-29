// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore

describe('content-script', function () {
  it('should setup the bridge between content-script and inpage', async function () {
    window.addEventListener = jest.fn()
    expect(browser.runtime.connect).not.toHaveBeenCalled()
    await import('./index.js')
    expect(browser.runtime.connect).toHaveBeenCalledWith({
      name: 'content-script',
    })
    expect(window.addEventListener).toHaveBeenCalledTimes(2)
    expect(window.addEventListener.mock.calls[0][0]).toBe('message')
    expect(typeof window.addEventListener.mock.calls[0][1]).toBe('function')
    expect(window.addEventListener.mock.calls[0][2]).toBe(false)

    expect(window.addEventListener.mock.calls[1][0]).toBe('DOMContentLoaded')
    expect(typeof window.addEventListener.mock.calls[1][1]).toBe('function')

    browser.extension.getURL = jest.fn(() => 'http://foo/bar.js')
    expect(document.head.childNodes.length).toBe(0)
    window.addEventListener.mock.calls[1][1]()
    expect(browser.extension.getURL).toHaveBeenCalledWith('inpage.js')
    expect(document.head.childNodes.length).toBe(1)
    expect(document.head.childNodes[0].src).toBe(`http://foo/bar.js`)
    expect(document.head.childNodes[0].async).toBe(false)
  })
})
