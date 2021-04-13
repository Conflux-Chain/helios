const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
    },
    cfxOnly: {
      doc: 'If this vault is only for conflux chain',
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
      identity: true,
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
