export const LEDGER_APP_NAME = {
  CONFLUX: 'Conflux',
  ETHEREUM: 'Ethereum',
  ESPACE: 'Conflux eSpace',
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/USBDevice/productID
 * Attention: as the doc said, the productId can identify a USB device.
 * But, the productId I get when I open different app using a same NanoS device is different,
 * for example, the productId is 4113 when I open Conflux App,the productId is 4117 when I open Ethereum App.
 */
export const LEDGER_NANOS_ID = 4113
export const LEDGER_NANOX_ID = 16401
export const LEDGER_NANOS_PRODUCT_NAME = 'Nano S'
export const LEDGER_NANOX_PRODUCT_NAME = 'Nano X'
export const LEDGER_NANOS_NAME = 'LedgerNanoS'
export const LEDGER_NANOX_NAME = 'LedgerNanoX'
export const LEDGER_DEVICE = {
  [LEDGER_NANOS_PRODUCT_NAME]: {
    NAME: LEDGER_NANOS_NAME,
    PRODUCT_NAME: 'Nano S',
    VERDOR_ID: '0x2c97', //11415
  },
  [LEDGER_NANOX_PRODUCT_NAME]: {
    NAME: LEDGER_NANOX_NAME,
    PRODUCT_NAME: 'Nano X',
    VERDOR_ID: '0x2c97', //11415
  },
}
export const LEDGER_CLA = 0xe0
export const INS = {
  OPEN_APP: 0xd8,
}
export const HDPATH = {
  CONFLUX: "44'/503'/0'/0",
  ETHEREUM: "44'/60'/0'/0",
  LEDGER_LIVE: "44'/60'/0'/0/0",
}

export const ERROR = {
  INVALID_CHANNEL: {
    ID: 'InvalidChannel',
    CODE: '5031', //means that the channel is busy, user should interact with this func a moment later
  },
}
