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

  - ref: true (default to false)
  Means this attribute is a reference to another entity.

  - component: true (default to false)
  Means this attribute is the representation of an entity and it's one of the
  children of the parent entity.
  */
const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
    },
    ddata: {
      doc: 'Decrypted vault data only in memory',
      persist: false,
    },
    cfxOnly: {
      doc: 'If this vault is only for conflux chain. This is used for address vault (vault data is a public address)',
    },
    accounts: {
      doc: 'Accounts belong to this vault',
      many: true,
      ref: true,
      component: true,
    },
  },
  account: {
    ethHexAddress: {
      value: true,
      doc: 'Account eth hex address',
    },
    cfxHexAddress: {
      identity: true,
      doc: 'Account cfx hex address',
    },
    vault: {
      ref: true,
      doc: 'Entity ID of vault',
    },
    hdIndex: {
      doc: 'The index of this account in hd wallet',
    },
  },
}

export default schema
