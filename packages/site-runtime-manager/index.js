/**
 * Site Runtime Manager
 * manages the runtime data of sites (e.g. post)
 * these data are not persisted to the database and are only maintained in memory
 */
class SiteRuntimeManager {
  constructor() {
    this.init()
  }

  async init() {
    this.sites = new Map()
    this.tabs = new Map()
    if (process.env.NODE_ENV !== 'test') {
      // listen tab close event
      const browser = (await import('webextension-polyfill')).default
      browser.tabs.onRemoved.addListener(this.onTabRemoved.bind(this))
    }
  }

  /**
   * update tabs map
   * @param {string} origin - origin
   * @param {number} tabId - tabId
   */
  updateTabs(origin, tabId) {
    if (this.tabs.has(tabId)) {
      const prevOrigin = this.tabs.get(tabId)
      // if the origin of the tabId changes, remove the old mapping relationship
      if (origin !== prevOrigin) {
        this.removeSite2Tab(prevOrigin, tabId)
      }
    }
    this.tabs.set(tabId, origin)
  }

  /**
   * remove tabId after tab close
   * @param {number} tabId - tabId
   */
  onTabRemoved(tabId) {
    if (this.tabs.has(tabId)) {
      const origin = this.tabs.get(tabId)
      this.tabs.delete(tabId)
      this.removeSite2Tab(origin, tabId)
    }
  }

  /**
   * add a post function to the site
   * @param {string} origin - origin
   * @param {object} {post, tabId} - post function and tabId
   */
  addPostListener(origin, {post, tabId}) {
    if (!origin || typeof post !== 'function') {
      throw new Error('Invalid origin or post function')
    }

    if (!this.sites.has(origin)) {
      this.sites.set(origin, {
        [tabId]: post,
      })
    } else {
      const site = this.sites.get(origin)
      site[tabId] = post
    }
    this.updateTabs(origin, tabId)
  }

  /**
   * get post functions of a site
   * @param {string} origin - origin
   * @returns {array|null}
   */
  getPosts(origin) {
    return this.sites.get(origin) ? Object.values(this.sites.get(origin)) : null
  }

  /**
   * get post function of a site with specific tabId
   * @param {string} origin - origin
   * @param {number} tabId - tabId
   * @returns {function|undefined|null}
   */
  getPostsWithTabId(origin, tabId) {
    return this.sites.get(origin) ? this.sites.get(origin)[tabId] : null
  }

  /**
   * remove a post listener of a tabId
   * @param {string} origin - origin
   * @param {number} tabId - tabId
   */
  removePostListener(origin, tabId) {
    this.removeSite2Tab(origin, tabId)
    const _origin = this.tabs.get(tabId)
    if (origin === _origin) {
      this.tabs.delete(tabId)
    }
  }

  /**
   * get all origins of sites
   * @returns {string[]}
   */
  getAllOrigins() {
    return Array.from(this.sites.keys())
  }

  /**
   * remove the mapping relationship of tab in site
   * @param {string} origin - origin
   * @param {number} tabId - tabId
   */
  removeSite2Tab(origin, tabId) {
    const site = this.sites.get(origin)
    if (site) {
      delete site[tabId]
      const size = Object.keys(site).length
      // site is empty, delete site
      if (size === 0) {
        this.sites.delete(origin)
      }
    }
  }
}

export const siteRuntimeManager = new SiteRuntimeManager()

export default SiteRuntimeManager
