let portalGlobalProvider = window.conflux
let TakeOverInterval = null

function _takeOver(PROVIDER, resolve) {
  if (window.conflux === PROVIDER) return
  if (!TakeOverInterval) return
  if (!window.conflux) return
  portalGlobalProvider = window.conflux
  window.conflux = PROVIDER
  clearInterval(TakeOverInterval)
  resolve(true)
}

export async function takeOver(PROVIDER) {
  if (!PROVIDER) return
  return await new Promise(resolve => {
    TakeOverInterval = setInterval(() => _takeOver(PROVIDER, resolve), 50)
  })
}

export function handBack() {
  if (!portalGlobalProvider) return
  if (TakeOverInterval) clearInterval(TakeOverInterval)
  window.conflux = portalGlobalProvider
}
