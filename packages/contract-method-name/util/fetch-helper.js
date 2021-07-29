let request = window?.fetch
const fetchHelper = async (url, method, options) => {
  if (!request) {
    request = await (await import('node-fetch')).default
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
