import browser from 'webextension-polyfill'

function notificationOnClicked(notificationId) {
  if (notificationId.startsWith('https://')) {
    browser.tabs.create({url: notificationId})
  }
}

function subscribeToNotificationClicked() {
  if (!browser.notifications.onClicked.hasListener(notificationOnClicked)) {
    browser.notifications.onClicked.addListener(notificationOnClicked)
  }
}

export function create(options = {}) {
  const {
    id,
    type = 'basic',
    message = '',
    title = 'Fluent wallet',
    iconUrl = 'images/icon-64.png',
  } = options
  subscribeToNotificationClicked()
  return browser.notifications.create(id ?? undefined, {
    type,
    message,
    title,
    iconUrl,
  })
}
