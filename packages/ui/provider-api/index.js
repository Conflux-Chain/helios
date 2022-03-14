import Provider from './Provider.js'

export const initProvider = (stream, send) => {
  return new Provider(stream, send)
}
