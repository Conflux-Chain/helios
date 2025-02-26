import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import {decode} from '@fluent-wallet/base32-address'
import {LEDGER_APP_NAME, LEDGER_CLA, INS, HDPATH, ERROR} from './const.js'
import {handleName} from './index.js'

/**
 * Connecting Ledger Conflux App API for fluent
 *
 * @example
 * import {Conflux} from "@fluent-wallet/ledger";
 * const cfx = new Conflux()
 * cfx.getAddress("44'/503'/0'/0/0").then(o => o.publicKey)
 */

export default class Conflux {
  app = null
  transport = null
  constuctor() {
    this.app = null
    this.transport = null
  }

  async createApp(transport) {
    const App = await import('@fluent-wallet/hw-app-conflux')
    this.app = new App.default(transport)
    this.transport = transport
  }

  async setApp() {
    if (!this.app) {
      try {
        const transport = await TransportWebHID.create()
        await this.createApp(transport)
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
  async getAddress(hdPath) {
    await this.setApp()
    return this.app?.getAddress(hdPath)
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
    return this.app?.getAppConfiguration()
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
    const devices = await TransportWebHID.list()
    return Boolean(devices.length)
  }

  async isAppOpen() {
    try {
      const isAuthed = await this.isDeviceAuthed()
      if (!isAuthed) return false
      const {name} = await this.getAppConfiguration()
      return name === LEDGER_APP_NAME.CONFLUX
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
        Buffer.from(LEDGER_APP_NAME.CONFLUX, 'ascii'),
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
      const transport = await TransportWebHID?.request()
      if (!this.app) {
        await this.createApp(transport)
      }
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
        const hdPath = `${HDPATH.CONFLUX}/${index}`
        const {address} = await this.getAddress(hdPath)
        const {hexAddress} = decode(address)
        addressArr.push({
          address: hexAddress,
          hdPath,
        })
      }
    } catch (error) {
      return Promise.reject(this.handleTheError(error))
    }
    return addressArr
  }

  async getDeviceInfo() {
    const devices = await TransportWebHID.list()
    if (devices.length > 0) {
      const device = devices[0]
      return {
        name: handleName(device?.productName),
        productId: device?.productId, //deprecated
        productName: device?.productName, //deprecated
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
