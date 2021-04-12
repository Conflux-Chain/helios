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
    hexAddress: {
      identity: true,
      doc: 'Account hex address',
    },
    vault: {
      ref: true,
      doc: 'Entity ID of vault',
    },
  },
}

export default schema
