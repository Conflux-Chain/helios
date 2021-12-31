import browser from 'webextension-polyfill'

export const set = ({text = '', color = '#037DD6'}) => {
  return Promise.all([
    browser.browserAction.setBadgeText({text: text?.toString()}),
    browser.browserAction.setBadgeBackgroundColor({color}),
  ])
}

export const clear = () => {
  return browser.browserAction.setBadgeText({text: ''})
}
