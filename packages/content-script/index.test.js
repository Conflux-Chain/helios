import {expect, describe, it} from 'vitest'

describe.skip('content-script', () => {
  it('should setup the bridge between content-script and inpage', async () => {
    window.addEventListener = jest.fn()
    expect(browser.runtime.connect).not.toHaveBeenCalled()
    // eslint-disable-next-line import/no-unresolved
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

    browser.runtime.getURL = jest.fn(() => 'http://foo/bar.js')
    expect(document.head.childNodes.length).toBe(0)
    window.addEventListener.mock.calls[1][1]()
    expect(browser.runtime.getURL).toHaveBeenCalledWith('inpage.js')
    expect(document.head.childNodes.length).toBe(1)
    expect(document.head.childNodes[0].src).toBe('http://foo/bar.js')
    expect(document.head.childNodes[0].async).toBe(false)
  })
})
