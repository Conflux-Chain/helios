import browser from 'webextension-polyfill'
import {
  createDomainService,
  downloadFeed,
  FEED_URL,
  SNAPSHOT_PATH,
  SYNC_MINUTES,
} from './service.js'

const domains = createDomainService({
  storage: browser.storage.local,
  loadBundled: async () =>
    (await downloadFeed(browser.runtime.getURL(SNAPSHOT_PATH), fetch)).feed,
  download: etag => downloadFeed(FEED_URL, fetch, etag),
})

// Background-only API for the next PR. Never send an origin to the feed server.
export const checkPhishingOrigin = domains.checkOrigin

export function startDomainSync(
  alarms = browser.alarms,
  refresh = domains.refresh,
) {
  const name = 'phishing.refreshMetaMaskDomains'
  // Register synchronously so an alarm can wake an MV3 worker. Do not reset
  // an existing alarm on every wake, or frequent restarts could postpone it forever.
  alarms.onAlarm.addListener(alarm => {
    if (alarm.name === name) return refresh()
  })
  return alarms.get(name).then(existing => {
    if (!existing)
      return alarms.create(name, {
        delayInMinutes: 1,
        periodInMinutes: SYNC_MINUTES,
      })
  })
}
