import {address, Drip} from 'js-conflux-sdk'

export const convertMappedAdress = (cfxAdress: string): string =>
  (address as any).cfxMappedEVMSpaceAddress(cfxAdress)

export class Unit {
  drip: bigint // Decimal Drip

  constructor(drip: bigint) {
    this.drip = drip
  }

  static fromDecimalCfx = (cfxValue: string) => {
    return new Unit(BigInt(String(Drip.fromCFX(cfxValue))));
  }

  static fromDecimalDrip = (dripValue: string | number) => {
    return new Unit(BigInt(dripValue))
  }

  static fromHexDrip = (hexDripValue: string) => {
    return new Unit(BigInt(hexDripValue))
  }

  toDecimalCfx = () => {
    return new Drip(String(this.drip) as unknown as number).toCFX();
  }

  toDecimalDrip = () => {
    return this.drip.toString()
  }

  toHexDrip = () => {
    return `0x${this.drip.toString(16)}`
  };

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default') {
    return hint == 'string' ? this.toDecimalCfx() : this.drip
  }
}