import browser from 'webextension-polyfill'

export const getCurrent = () => browser.tabs.query({active: true})
