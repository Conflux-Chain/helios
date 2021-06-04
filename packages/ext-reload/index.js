import browser from 'webextension-polyfill'
import {chan} from '@cfxjs/csp'

const changedChan = chan()
const watchingDirRegex = /.*/
const ignoreDirRegex = /(\/\.|\/build\/)/
const ignoreFileRegex = /(^\.|^package\.json$)/
const watchingFileRegex = /.*/

const reload = () => {
  const tab = browser.tabs.query({active: true, lastFocusedWindow: true})[0]
  if (tab?.url?.startsWith('http')) browser.tabs.reload(tab.id)
  browser.runtime.reload()
}

const filesInDirectory = dir => {
  dir.createReader().readEntries(entries =>
    entries.forEach(e => {
      if (
        e.isDirectory &&
        !ignoreDirRegex.test(e.fullPath) &&
        watchingDirRegex.test(e.fullPath)
      )
        filesInDirectory(e)
      else if (
        e.isFile &&
        !ignoreFileRegex.test(e.name) &&
        watchingFileRegex.test(e.name)
      )
        e.file(changedChan.write.bind(changedChan))
    }),
  )
}

// firefox don't have this function
if (browser.runtime.getPackageDirectoryEntry)
  browser.management.getSelf().then(self => {
    if (self.installType === 'development') {
      setInterval(
        () => browser.runtime.getPackageDirectoryEntry(filesInDirectory),
        500,
      )
    }
  })
;(async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const changedFile = await changedChan.read()
    if (new Date().getTime() - changedFile.lastModified < 500) {
      setTimeout(reload, 500)
    }
  }
})()
