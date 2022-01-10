import {Drip, address} from 'js-conflux-sdk'

export const convertCFX2Drip = (cfx: string | number) =>
  String(
    Drip.fromCFX(typeof cfx === 'number' ? String(cfx) : String(parseInt(cfx))),
  )

export const convertDrip2CFX = (drip: string | number) =>
  new Drip(typeof drip === 'number' ? drip : parseInt(drip)).toCFX()

export const convertMappedAdress = (cfxAdress: string): string =>
  (address as any).cfxMappedEVMSpaceAddress(cfxAdress)
