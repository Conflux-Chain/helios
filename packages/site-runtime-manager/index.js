/**
 * Site Runtime Manager
 * manages the runtime data of sites (e.g. post)
 * these data are not persisted to the database and are only maintained in memory
 */
class SiteRuntimeManager {
  constructor() {
    this.sites = new Map()
  }

  /**
   * add a post function to the site
   * @param {string} origin - origin
   * @param {object} {post, postId} - post function and postId
   */
  addPostListener(origin, {post, postId}) {
    if (!origin || typeof post !== 'function') {
      throw new Error('Invalid origin or post function')
    }

    if (!this.sites.has(origin)) {
      this.sites.set(origin, {
        [postId]: post,
      })
    } else {
      const site = this.sites.get(origin)
      site[postId] = post
    }
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
   * remove a post listener of a postId
   * @param {string} origin - origin
   * @param {number} postId - postId
   */
  removePostListener(origin, postId) {
    const site = this.sites.get(origin)
    if (site) {
      delete site[postId]
      const size = Object.keys(site).length
      // site is empty, delete site
      if (size === 0) {
        this.sites.delete(origin)
      }
    }
  }

  /**
   * get all origins of sites
   * @returns {string[]}
   */
  getAllOrigins() {
    return Array.from(this.sites.keys())
  }
}

export const siteRuntimeManager = new SiteRuntimeManager()

export default SiteRuntimeManager
