/*
  Documentation about db schema

  - identity: true (default to false)
  Means there will no duplicate records of the same attribute with same value,
  eg. `:account/ethHexAddress` has the 'identity: true', so that there will only
  be one account if you run `db.createAccount({ethHexAddress: 1})` twice, cause
  they are the same account.
  https://docs.datomic.com/on-prem/schema/identity.html#unique-identities

  - value: true (default to false)
  Same as identity: true, but will throw a error if try to insert the same attribute
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
  hdPath: {
    value: {value: true},
    name: {identity: true},
  },
  network: {
    name: {
      identity: true,
      doc: "Name of a network, used as id of network, builtin network name can't be changed, reload(reinit) the extension if network name changed",
    },
    endpoint: {
      value: true,
      doc: "RPC endpoint of a network, can't be duplicate",
    },
    type: {
      doc: "One of 'cfx'/'eth', indicating type of rpc set of this network",
    },
    hdPath: {ref: true},
    chainId: {doc: 'Network chain id'},
    netId: {doc: 'Network id'},
    ticker: {doc: 'Network currency symbol'},
  },
  /*
    vault, container of credential (address/pk/mnemonic)
    */
  vault: {
    type: {doc: 'Type of vault: public, pk, mnemonic'},
    data: {doc: 'Encrypted vault data'},
    ddata: {doc: 'Decrypted vault data only in memory', persist: false},
    cfxOnly: {
      doc: 'If this vault is only for conflux chain. This is used for address vault (vault data is a public address) or 0x1 prefix only hd vault',
    },
  },
  accountGroup: {
    vault: {ref: true, doc: 'Entity ID of vault', identity: true},
    nickname: {value: true},
    customHdPath: {
      ref: 'hdPath',
      doc: 'Entity ID of hd path, when set, will use this custom hd path for whatever network',
    },
    network: {
      doc: 'Network supported by this account group',
      ref: true,
    },
    hidden: {doc: 'If hide this accountGroup in ui'},
  },
  address: {
    id: {tuples: ['address/network', 'address/hex'], identity: true},
    vault: {ref: true},
    network: {ref: true},
    index: {doc: 'Address index in hd path, starts from 0'},
    hex: {doc: 'The value of the address, not cfx hex address'},
    cfxHex: {doc: 'The value of cfx hex address'},
    base32: {doc: 'cfx mainnet base32 address'},
    pk: {doc: 'the private key of the address', persist: false},
  },
  account: {
    id: {tuples: ['account/index', 'account/accountGroup'], identity: true},
    index: {doc: 'index of account in account group'},
    nickname: {doc: 'account nickname'},
    address: {ref: 'address', many: true},
    accountGroup: {ref: true},
    hidden: {doc: 'If hide this account in ui'},
  },
}

export default schema
