import browser from 'webextension-polyfill'

export const set = ({text = '', color = 'green'}) => {
  return Promise.all([
    browser.browserAction.setBadgeText({text}),
    browser.browserAction.setBadgeBackgroundColor({color}),
  ])
}

export const clear = () => {
  return browser.browserAction.setBadgeText({text: ''})
}
