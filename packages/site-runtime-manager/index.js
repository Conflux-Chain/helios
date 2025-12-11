import browser from 'webextension-polyfill'

/**
 * Site Runtime Manager
 * 管理 site 的内存运行时数据（如 post ）
 * 这些数据不被持久化到数据库，只在内存中维护
 */
class SiteRuntimeManager {
  constructor() {
    this.sites = new Map()
    this.tabs = new Map()
    // 监听 tab 关闭事件
    browser.tabs.onRemoved.addListener(this.onTabRemoved.bind(this))
  }

  /**
   * 更新 tabs 映射
   * @param {string} origin - site 的 origin
   * @param {number} tabId - tabId
   */
  updateTabs(origin, tabId) {
    if (this.tabs.has(tabId)) {
      const prevOrigin = this.tabs.get(tabId)
      // 如果 tabId 对应的 origin 发生变化，则移除旧的映射关系
      if (origin !== prevOrigin) {
        this.removeSite2Tab(prevOrigin, tabId)
      }
    }
    this.tabs.set(tabId, origin)
  }

  /**
   * tab 关闭后处理过期数据
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
   * 添加一个 post 函数
   * @param {string} origin - site 的 origin
   * @param {object} {post, tabId} - 要添加的 post 函数 及对应的 tabId
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
   * 获取 site 的 post 函数列表
   * @param {string} origin - site 的 origin
   * @returns {array|null}
   */
  getPosts(origin) {
    return this.sites.get(origin) ? Object.values(this.sites.get(origin)) : null
  }

  /**
   * 获取 site 指定 tabId 的 post 函数
   * @param {string} origin - site 的 origin
   * @param {number} tabId - site 的 tabId
   * @returns {function|undefined|null}
   */
  getPostsWithTabId(origin, tabId) {
    return this.sites.get(origin) ? this.sites.get(origin)[tabId] : null
  }

  /**
   * 移除一个 tabId post 监听器
   * @param {string} origin - site 的 origin
   * @param {number} tabId - 要移除的 tabId
   */
  removePostListener(origin, tabId) {
    this.removeSite2Tab(origin, tabId)
    const _origin = this.tabs.get(tabId)
    if (origin === _origin) {
      this.tabs.delete(tabId)
    }
  }

  /**
   * 获取所有 site 的 origins
   * @returns {string[]}
   */
  getAllOrigins() {
    return Array.from(this.sites.keys())
  }

  /**
   * 移除 site 中 tab 的映射关系
   * @param {string} origin - site 的 origin
   * @param {number} tabId - 要移除的 tabId
   */
  removeSite2Tab(origin, tabId) {
    const site = this.sites.get(origin)
    if (site) {
      delete site[tabId]
      const size = Object.keys(site).length
      // site 下没有 tabId 了，删除 site
      if (size === 0) {
        this.sites.delete(origin)
      }
    }
  }
}

// 创建单例实例
export const siteRuntimeManager = new SiteRuntimeManager()

export default SiteRuntimeManager
