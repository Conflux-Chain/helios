import browser from 'webextension-polyfill'

export const set = ({text = '', color = '#037DD6'}) => {
  return Promise.all([
    browser.action.setBadgeText({text: text?.toString()}),
    browser.action.setBadgeBackgroundColor({color}),
  ])
}

export const clear = () => {
  return browser.action.setBadgeText({text: ''})
}
