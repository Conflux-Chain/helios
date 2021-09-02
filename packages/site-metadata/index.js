/**
 * Gets site metadata and returns it
 *
 */
export async function getSiteMetadata() {
  if (!window) return {name: null, icon: null}

  return {
    name: getSiteName(window),
    icon: await getSiteIcon(window),
  }
}

/**
 * Extracts a name for the site from the DOM
 */
export function getSiteName(windowObject) {
  const {document} = windowObject

  const siteName = document.querySelector(
    'head > meta[property="og:site_name"]',
  )
  if (siteName) {
    return siteName.content
  }

  const metaTitle = document.querySelector('head > meta[name="title"]')
  if (metaTitle) {
    return metaTitle.content
  }

  if (document.title && document.title.length > 0) {
    return document.title
  }

  return window.location.hostname
}

/**
 * Extracts an icon for the site from the DOM
 * @returns an icon URL
 */
export async function getSiteIcon(windowObject) {
  const {document} = windowObject

  const icons = document.querySelectorAll('head > link[rel~="icon"]')

  for (const icon of icons) {
    if (icon && (await imgExists(icon.href))) {
      return icon.href
    }
  }

  const favicon = `https://${location.host}/favicon.ico`
  if (await imgExists(favicon)) return favicon

  return null
}

/**
 * Returns whether the given image URL exists
 * @param url - the url of the image
 * @returns Whether the image exists.
 */
export function imgExists(url) {
  if (!document)
    throw new Error("Don't support detect image existence in none browser env")

  return new Promise((resolve, reject) => {
    try {
      const img = document.createElement('img')
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    } catch (e) {
      reject(e)
    }
  })
}
