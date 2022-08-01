// # db schema
/*
  Documentation about db schema

  - identity: true (default to false)
  Means there will no duplicate records of the same attribute with same value,
  eg. `:account/ethHexAddress` has the 'identity: true', so that there will only
  be one account if you run `db.createAccount({ethHexAddress: 1})` twice, cause
  they are the same account.
  https://docs.datomic.com/on-prem/schema/identity.html#unique-identities

  - value: true (default to false)
  Same as identity: true, but will throw an error if try to insert the same attribute
  twice. https://docs.datomic.com/on-prem/schema/identity.html#unique-values

  - persist: false (default to true)
  Means the attribute won't be available in the result of `SerializeToStr(db)`.
  Note that this is a custom implementation in this project.

  - ref: true/model-name (default to false)
  Means this attribute is a reference to another entity.
  When set to true, use the attribute name as the ref model name.
  When set to string, use the string as the ref model name.

  - component: true (default to false)
  Means this attribute is the representation of an entity and it's one of the
  children of the parent entity.
  Doc about component feature https://blog.datomic.com/2013/06/component-entities.html
  */
const schema = {
  // ## basic
  hdPath: {
    value: {value: true},
    name: {identity: true},
  },
  network: {
    name: {
      identity: true,
      doc: "Name of a network, used as id of network, builtin network name can't be changed, reload(reinit) the extension if network name changed",
    },
    icon: {doc: 'Array of icon url of this network'},
    endpoint: {
      value: true,
      doc: "RPC endpoint of a network, can't be duplicate",
    },
    type: {
      doc: "One of 'cfx'/'eth', indicating type of rpc set of this network",
    },
    hdPath: {ref: true},
    chainId: {doc: 'Network chain id, hexadecimal'},
    netId: {doc: 'Network id, decimal'},
    ticker: {
      doc: 'A object with info of the currency, eg. {name: "Ethereum", symbol: "CFX", decimals: 18, iconUrls: [...svg]}',
    },
    builtin: {doc: "Indicating builtin network, shouldn't be deleted"},
    scanUrl: {doc: 'Url of block chain explorer'},
    selected: {doc: 'network selected by wallet'},
    cacheTime: {doc: 'epoch/block time of this network'},
    tokenList: {
      doc: 'token list of this network',
      ref: true,
      component: true,
    },
    balanceChecker: {doc: 'balance checker contract address'},
    isMainnet: {doc: 'is mainnet network'},
    isTestnet: {doc: 'is testnet network'},
    isCustom: {doc: 'is custom network'},
  },
  /*
    vault, container of credential (address/pk/mnemonic)
    */
  vault: {
    type: {doc: 'Type of vault: pub, pk, hd, hw'},
    data: {doc: 'Encrypted vault data'},
    device: {doc: 'vault device, default is FluentWebExt'},
    ddata: {doc: 'Decrypted vault data only in memory', persist: false},
    cfxOnly: {
      doc: 'If type is pub/hw, means this vault is only for cfx type network, if type is hd, means only generate 0x1 prefix account',
    },
  },
  accountGroup: {
    nickname: {doc: 'account group nickname'},
    vault: {
      ref: true,
      doc: 'Entity ID of vault',
      identity: true,
      component: true,
    },
    // hdPath: {
    //   ref: 'hdPath',
    //   doc: 'Entity ID of hd path, when set, will use this custom hd path for whatever network',
    // },
    // network: {
    //   doc: 'Network supported by this account group',
    //   ref: true,
    // },
    hidden: {doc: 'If hide this accountGroup in ui'},
    account: {ref: true, many: true, component: true},
  },
  address: {
    id: {tuples: ['address/network', 'address/value'], identity: true},
    network: {ref: true},
    value: {doc: 'address string, hex or base32 based on network'},
    hex: {doc: 'The value of the address, not cfx hex address'},
    nativeBalance: {doc: 'balance of this address'},
    pk: {doc: 'the private key of the address', persist: false},
    balance: {
      doc: 'token balances of this address',
      many: true,
      ref: true,
      component: true,
    },
    token: {
      doc: 'tokenlist of this address',
      many: true,
      ref: true,
    },
    antiToken: {
      doc: 'black tokenlist of this address',
      many: true,
      ref: true,
    },
    tx: {
      doc: 'transactions of this address',
      many: true,
      component: true,
      ref: true,
    },
  },
  account: {
    index: {doc: 'index of account in account group'},
    nickname: {doc: 'account nickname'},
    address: {many: true, ref: true},
    hidden: {doc: 'If hide this account in ui'},
    offline: {doc: 'Offline account'},
    selected: {doc: 'selected by wallet'},
  },

  // ## tx
  tx: {
    txPayload: {
      doc: 'tx payload as an object',
      ref: true,
      component: true,
    },
    raw: {doc: 'raw tx hash'},
    hash: {
      doc: 'tx hash',
      identity: true,
    },
    status: {
      doc: 'int, tx status, -2 skipped, -1 failed, 0 unsent, 1 sending, 2 pending, 3 packaged, 4 executed, 5 confirmed',
    },
    receipt: {doc: 'receipt as an object'},
    blockNumber: {
      doc: 'latest block number after getting raw tx, only eth type tx has this value',
    },
    blockHash: {doc: 'block this tx packaged in'},
    chainSwitched: {doc: 'chain switched'},
    created: {doc: 'created timestamp get with new Date().getTime()'},
    pendingAt: {doc: 'first time pending timestamp'},
    err: {doc: 'basic error type/info'},
    txExtra: {doc: 'enriched tx info', ref: true, component: true},
    fromFluent: {doc: 'tx submitted from fluent'},
    fromScan: {doc: 'tx is from scan'},
    resendAt: {doc: 'epoch/block where wallet resend tx'},
  },
  txPayload: {
    type: {doc: 'tx type'},
    accessList: {doc: 'accessList'},
    maxFeePerGas: {doc: 'maxFeePerGas'},
    maxPriorityFeePerGas: {doc: 'maxPriorityFeePerGas'},
    from: {doc: 'from addr'},
    to: {doc: 'to addr'},
    gasPrice: {doc: 'gasPrice'},
    gas: {doc: 'gas'},
    storageLimit: {doc: 'storageLimit'},
    data: {doc: 'data'},
    value: {doc: 'value'},
    nonce: {doc: 'nonce'},
    chainId: {doc: 'chainId'},
    epochHeight: {doc: 'epochHeight'},
  },
  txExtra: {
    ok: {doc: 'extra data is finished'},
    contractCreation: {doc: 'contract creation tx'},
    simple: {doc: 'simple tx'},
    contractInteraction: {doc: 'contract interaction tx'},
    token20: {doc: '20 contract'},
    tokenNFT: {doc: 'nft contract'},
    address: {doc: 'intresting address of this tx, usually recipient'},
    method: {doc: 'contract call method name'},
  },

  // ## dapp interaction
  site: {
    origin: {
      identity: true,
      doc: 'domain of the map, eg: https://.* or chrome-extension://.*',
    },
    name: {doc: 'site name'},
    icon: {doc: 'site icon href'},
    post: {
      persist: false,
      doc: 'the function to post message to inpage runtime',
    },
  },
  app: {
    site: {ref: true, identity: true},
    name: {doc: 'name of the app'},
    perms: {
      doc: 'authorized permissions, eg. {wallet_basic: {}, wallet_accounts: {}}',
    },
    permUpdatedAt: {doc: 'permision last updated at, generated by Date.now()'},
    account: {doc: 'authed accounts', ref: true, many: true},
    currentAccount: {ref: 'account'},
    network: {doc: 'authed network', ref: true, many: true},
    currentNetwork: {ref: 'network'},
    tx: {many: true, ref: true, doc: 'tx initiated by this app'},
  },
  authReq: {
    req: {doc: 'the req body of the auth req', persist: false},
    processed: {doc: 'if user reacted to this'},
    site: {ref: true, persist: false},
    app: {ref: true, persist: false},
    c: {doc: 'csp channel of the req listener', persist: false},
  },
  balance: {
    value: {doc: 'balance value of one address/token tuple in hex'},
  },

  // ## utils
  unlockReq: {
    req: {persist: false},
  },

  // ## tokens
  token: {
    id: {tuples: ['token/network', 'token/address'], identity: true},
    network: {ref: true},
    name: {doc: 'token name'},
    address: {doc: 'address, hex or base32'},
    symbol: {doc: 'token symbol'},
    decimals: {doc: 'token decimal'},
    logoURI: {doc: 'token logo image'},
    fromList: {doc: 'true when from token list'},
    fromApp: {doc: 'true when from app'},
    fromUser: {doc: 'true when from user'},
    tx: {doc: 'token txs', ref: true, many: true},
    balance: {
      doc: 'balances of this token',
      ref: true,
      many: true,
      component: true,
    },
    // ... other values in TokenInfoSchema
  },
  tokenList: {
    url: {doc: 'token list url', identity: true},
    name: {doc: 'token list name'},
    value: {doc: 'token list value, json data get from token list'},
    token: {
      doc: 'token of this token list',
      many: true,
      ref: true,
    },
  },

  // # general addr, not linked to accounts
  gaddr: {
    id: {tuples: ['gaddr/network', 'gaddr/value'], identity: true},
    value: {doc: 'addr value'},
    network: {ref: true},
  },

  // # memo
  memo: {
    id: {tuples: ['memo/gaddr', 'memo/value'], identity: true},
    gaddr: {ref: true},
    value: {doc: 'memo content'},
  },

  // # db
  dbmeta: {version: {doc: 'db version'}},
}

export default schema
