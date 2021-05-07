import browser from 'webextension-polyfill'

const reloadDir = ['images', '_locales']

const filesInDirectory = dir =>
  new Promise(resolve =>
    dir.createReader().readEntries(entries =>
      Promise.all(
        entries
          .filter(e => e.name[0] !== '.')
          .map(e => {
            if (e.isDirectory && reloadDir.includes(e.name))
              return filesInDirectory(e)
            if (e.isFile) return new Promise(resolve => e.file(resolve))
            return Promise.resolve(false)
          }),
      )
        .then(files => [].concat(...files))
        .then(resolve),
    ),
  )

const timestampForFilesInDirectory = async dir => {
  const files = await filesInDirectory(dir)
  return files
    .reduce((acc, f) => {
      if (!f) return acc
      if (f.name.endsWith('.html') || f.name.endsWith('.js'))
        acc.push(f.name + f.lastModifiedDate)
      return acc
    }, [])
    .join()
}

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), 500)
    } else {
      browser.runtime.reload()
    }
  })
}

// firefox don't have this function
if (browser.runtime.getPackageDirectoryEntry)
  browser.management.getSelf().then(self => {
    if (self.installType === 'development') {
      browser.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
      browser.tabs.query({active: true, lastFocusedWindow: true}).then(tabs => {
        // NB: see https://github.com/xpl/crx-hotreload/issues/5
        if (tabs[0]) {
          setTimeout(() => browser.tabs.reload(tabs[0].id), 400)
        }
      })
    }
  })
