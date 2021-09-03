import browser from 'webextension-polyfill'

export const create = (options = {}) => {
  const {
    id = '__FLUENT_NOTIFICATION__',
    type = 'basic',
    message = '',
    title = 'Fluent wallet',
    iconUrl = 'images/icon-64.png',
  } = options
  return browser.notifications.create(id, {
    ...options,
    type,
    message,
    title,
    iconUrl,
  })
}
