import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import App from '@ledgerhq/hw-app-eth'

import {
  LEDGER_APP_NAME,
  LEDGER_CLA,
  INS,
  HDPATH,
  LEDGER_DEVICE,
  ERROR,
} from './const'

/**
 * Connecting Ledger Ethereum App API for fluent
 *
 * @example
 * import {Ethereum} from "@fluent-wallet/ledger";
 * const eth = new Ethereum()
 * eth.getAddress("44'/60'/0'/0/0").then(o => o.publicKey)
 */

export default class Ethereum {
  app = null
  transport = null
  constuctor() {
    this.app = null
    this.transport = null
  }

  async setApp() {
    if (!this.app) {
      try {
        this.transport = await TransportWebUSB.create()
        this.app = new App(this.transport)
      } catch (error) {
        console.warn(error)
      }
    }
  }

  /**
   * get address from ledger
   * @param {*} hdPath
   * @returns
   */
  async getAddress(hdPath, boolAddress, boolChainCode) {
    await this.setApp()
    return this.app?.getAddress(hdPath, boolAddress, boolChainCode)
  }

  /**
   * sign transaction
   * @param {*} hdPath
   * @param {*} txHex
   * @returns
   */
  async signTransaction(hdPath, txHex) {
    await this.setApp()
    try {
      const res = await this.app?.signTransaction(hdPath, txHex)
      return res
    } catch (error) {
      return Promise.reject(this.handleTheError(error))
    } finally {
      await this.cleanUp()
    }
  }

  /**
   * get configuration of ledger app
   * @returns
   */
  async getAppConfiguration() {
    await this.setApp()
    const r = await this.transport.send(0xb0, 0x01, 0x00, 0x00)
    let i = 0
    const format = r[i++]

    if (format !== 1) {
      throw new Error('getAppAndVersion: format not supported')
    }

    const nameLength = r[i++]
    const name = r.slice(i, (i += nameLength)).toString('ascii')
    const versionLength = r[i++]
    const version = r.slice(i, (i += versionLength)).toString('ascii')
    const flagLength = r[i++]
    const flags = r.slice(i, (i += flagLength))
    return {
      name,
      version,
      flags,
    }
  }

  /**
   * sign personal message
   * @param {*} hdPath the hd path
   * @param {*} messageHex hex string of message
   * @returns Promise
   */
  async signPersonalMessage(hdPath, messageHex) {
    await this.setApp()
    try {
      return this.app?.signPersonalMessage(hdPath, messageHex)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async isDeviceAuthed() {
    const devices = await TransportWebUSB.list()
    return Boolean(devices.length)
  }

  async isAppOpen() {
    try {
      const isAuthed = await this.isDeviceAuthed()
      if (!isAuthed) return false
      const config = await this.getAppConfiguration()
      const {name} = config
      return name === LEDGER_APP_NAME.ETHEREUM
    } catch (error) {
      return false
    } finally {
      await this.cleanUp()
    }
  }

  async openApp() {
    try {
      await this.transport?.send(
        LEDGER_CLA,
        INS.OPEN_APP,
        0x00,
        0x00,
        Buffer.from(LEDGER_APP_NAME.ETHEREUM, 'ascii'),
      )
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * auth the USBDevice
   * @returns boolean, means that whether user has already authed this hardware
   */
  async requestAuth() {
    try {
      await TransportWebUSB?.request()
      return true
    } catch (error) {
      return false
    }
  }

  async getAddressList(indexArray) {
    if (!Array.isArray(indexArray)) return []
    const isNumber = indexArray.every(function (item) {
      return typeof item === 'number'
    })
    if (!isNumber) return []
    const addressArr = []
    try {
      for (const index of indexArray) {
        const hdPath = `${HDPATH.ETHEREUM}${index}`
        const {address} = await this.getAddress(hdPath)
        addressArr.push({
          address,
          hdPath,
        })
      }
    } catch (error) {
      return Promise.reject(this.handleTheError(error))
    }
    return addressArr
  }

  async getDeviceInfo() {
    const devices = await TransportWebUSB.list()
    if (devices.length > 0) {
      const device = devices[0]
      return {
        name: LEDGER_DEVICE[device?.productName]?.NAME,
        productId: device?.productId,
        productName: device?.productName,
      }
    }
    return {}
  }

  /**
   * Close the transport when finish using it
   */
  async cleanUp() {
    this.app = null
    if (this.transport) await this.transport.close()
    this.transport = null
  }

  handleTheError(error) {
    if (error?.id === ERROR.INVALID_CHANNEL.ID) {
      error.appCode = ERROR.INVALID_CHANNEL.CODE
    }
    if (error?.message?.includes('UNKNOWN_ERROR')) {
      error.message = `Ledger connection error, please make sure the Ledger device is unlocked and open the Conflux App, and reopen this page. ${
        error?.statusCode ? '(0x' + error?.statusCode?.toString(16) + ')' : ''
      }`
    }
    return error
  }
}
