import fetch from 'node-fetch'

const fetchHelper = async (url, method, options) => {
  let request =
    window?.fetch && typeof window.fetch === 'function' ? window.fetch : null
  if (!request) {
    request = fetch
  }
  const response = await request(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
    referrer: 'no-referrer',
    cache: 'no-cache',
    ...options,
  }).catch(err => err)
  if (response.ok) {
    const json = await response.json()
    return json
  }
  return null
}

export default fetchHelper
