import PortalProvider from './PortalProvider.js'
import Provider from './Provider.js'

export const initProvider = (stream, send, useModernProviderAPI = false) => {
  if (useModernProviderAPI) {
    return new Provider(stream, send)
  }
  return new PortalProvider(stream, send)
}
