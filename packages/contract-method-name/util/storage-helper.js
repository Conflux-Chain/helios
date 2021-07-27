export const getStorageItem = key => {
  try {
    const serializedData = localStorage.getItem(key)
    if (serializedData === null) {
      return undefined
    }
    return JSON.parse(serializedData)
  } catch (err) {
    return undefined
  }
}

export const setStorageItem = (key, value) => {
  try {
    const serializedData = JSON.stringify(value)
    localStorage.setItem(key, serializedData)
  } catch (err) {
    console.warn(err)
  }
}
