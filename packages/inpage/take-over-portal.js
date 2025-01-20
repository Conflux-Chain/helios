const GlobalProviderCache = {
  cfx: window.conflux,
  eth: window.ethereum,
}
const TakeOverInterval = {cfx: null, eth: null}

function _takeOverConflux(PROVIDER, resolve) {
  if (window.conflux === PROVIDER) return
  if (!TakeOverInterval.cfx) return
  if (!window.conflux) return
  GlobalProviderCache.cfx = window.conflux
  Object.defineProperty(window, 'conflux', {value: PROVIDER, writable: false})
  clearInterval(TakeOverInterval.cfx)
  resolve(true)
}
function _takeOverEthereum(PROVIDER, resolve) {
  if (window.ethereum === PROVIDER) return
  if (!TakeOverInterval.eth) return
  if (!window.ethereum) return
  GlobalProviderCache.eth = window.ethereum
  Object.defineProperty(window, 'ethereum', {value: PROVIDER, writable: false})
  clearInterval(TakeOverInterval.eth)
  resolve(true)
}

export async function takeOver(PROVIDER, type = 'cfx') {
  if (!PROVIDER) return
  const takeOverFn = type === 'cfx' ? _takeOverConflux : _takeOverEthereum
  return await new Promise((resolve, reject) => {
    TakeOverInterval[type] = setInterval(() => {
      try {
        takeOverFn(PROVIDER, resolve)
      } catch (error) {
        if (error?.message?.includes('Cannot redefine property')) {
          clearInterval(TakeOverInterval[type])
          reject(error)
        }
      }
    }, 50)
  })
}

export function handBack(type = 'cfx') {
  if (type === 'cfx') {
    if (!GlobalProviderCache.cfx) return
    if (TakeOverInterval.cfx) clearInterval(TakeOverInterval.cfx)
    window.conflux = GlobalProviderCache.cfx
  } else {
    if (!GlobalProviderCache.eth) return
    if (TakeOverInterval.eth) clearInterval(TakeOverInterval.eth)
    window.ethereum = GlobalProviderCache.eth
  }
}
