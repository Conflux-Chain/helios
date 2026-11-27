import {createDomainSets} from './domain.js'

const STORAGE_KEYS = {metaMask: 'phishing.metamask', fluent: 'phishing.fluent'}
let storagePromise

// Share one lazy import; loading RPC docs needs no extension context.
function getStorage() {
  if (!storagePromise)
    storagePromise = import('webextension-polyfill')
      .then(({default: browser}) => browser.storage.local)
      .catch(error => {
        storagePromise = undefined
        throw error
      })
  return storagePromise
}

export async function loadStoredState() {
  const keys = Object.values(STORAGE_KEYS).flatMap(key => [key, `${key}.meta`])
  const storage = await getStorage()
  const stored = await storage.get(keys)
  return {
    metaMask: parseStoredSource('metaMask', stored),
    fluent: parseStoredSource('fluent', stored),
  }
}

function parseStoredSource(source, stored) {
  const key = STORAGE_KEYS[source]
  if (!stored[key]) return null
  try {
    const {whitelist, blacklist} = stored[key]
    const meta = stored[`${key}.meta`] ?? {}
    const lists = createDomainSets({allowlist: whitelist, blocklist: blacklist})
    if (source === 'metaMask') {
      if (!Number.isSafeInteger(meta.cursor) || meta.cursor <= 0)
        throw new Error('Invalid cached MetaMask cursor')
      return {
        lists,
        cursor: meta.cursor,
        etag: meta.etag,
        lastFullCheckAt: meta.fullAt,
        lastDiffCheckAt: meta.diffAt,
      }
    }
    return {lists, etag: meta.etag, lastCheckAt: meta.checkedAt}
  } catch (error) {
    console.warn(`[phishing] Ignoring invalid cache ${key}`, error)
    return null
  }
}

export async function saveSourceState(source, state, listsChanged) {
  const key = STORAGE_KEYS[source]
  const meta =
    source === 'metaMask'
      ? {
          cursor: state.cursor,
          etag: state.etag,
          fullAt: state.lastFullCheckAt,
          diffAt: state.lastDiffCheckAt,
        }
      : {etag: state.etag, checkedAt: state.lastCheckAt}
  const patch = {[`${key}.meta`]: meta}
  if (listsChanged) {
    patch[key] = {
      whitelist: [...state.lists.allowlist],
      blacklist: [...state.lists.blocklist],
    }
  }
  const storage = await getStorage()
  await storage.set(patch)
}
