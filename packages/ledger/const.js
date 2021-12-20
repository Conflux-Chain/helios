export const LEDGER_APP_NAME = {
  CONFLUX: 'Conflux',
}
export const LEDGER_NANOS_ID = 4113
export const LEDGER_NANOX_ID = 16401
export const LEDGER_VERDOR_ID = '0x2c97' //11415
export const LEDGER_DEVICE = {
  [LEDGER_NANOS_ID]: {
    NAME: 'LedgerNanoS',
    PRODUCT_NAME: 'Nano S',
    VERDOR_ID: LEDGER_VERDOR_ID,
  },
  [LEDGER_NANOX_ID]: {
    NAME: 'LedgerNanoX',
    PRODUCT_NAME: 'Nano X',
    VERDOR_ID: LEDGER_VERDOR_ID,
  },
}
export const LEDGER_CLA = 0xe0
export const INS = {
  OPEN_APP: 0xd8,
}
export const HDPATH = {
  CONFLUX: "44'/503'/0'/0/",
}

export const ERROR = {
  INVALID_CHANNEL: {
    ID: 'InvalidChannel',
    CODE: '5031', //means that the channel is busy, user should interact with this func a moment later
  },
}
