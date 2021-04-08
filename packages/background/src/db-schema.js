const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
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
