export * as ensjs from '@ensdomains/ensjs'
import {ENS} from '@ensdomains/ensjs/dist/esm/index.mjs'

const ens = new ENS()
await ens.setProvider(window.ethereum)

export const getName = address => {
  return ens.getName(address)
}

export const getAddress = (name, coinId) => {
  return ens.name(name).getAddress(coinId)
}
