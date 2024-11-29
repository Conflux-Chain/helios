const EIP6963EventNames = {
  Announce: 'eip6963:announceProvider',
  Request: 'eip6963:requestProvider',
}

export function announceProvider(providerDetail) {
  const _announceProvider = () =>
    window.dispatchEvent(
      new CustomEvent(EIP6963EventNames.Announce, {
        detail: Object.freeze(providerDetail),
      }),
    )

  _announceProvider()
  window.addEventListener(EIP6963EventNames.Request, _announceProvider)
  return () =>
    window.removeEventListener(EIP6963EventNames.Request, _announceProvider)
}
