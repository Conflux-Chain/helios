import React from 'react'
import {Parameters} from './'

export default {
  title: 'Doc Component/Input',
  component: Parameters,
}

const Template = args => <Parameters {...args} />

export const wallet_validatePassword = Template.bind({})
wallet_validatePassword.args = {
  parameters: {
    type: 'map',
    children: [
      {
        type: 'string',
        value: {
          doc: 'String between 8 to 128 character',
          type: 'password',
          htmlElement: {
            el: 'input',
          },
        },
        kv: true,
        k: 'password',
      },
    ],
  },

  rpcName: 'wallet_validatePassword',
}

export const wallet_addVault = Template.bind({})
wallet_addVault.args = {
  parameters: {
    type: 'or',
    children: [
      {
        type: 'map',
        children: [
          {
            type: 'string',
            value: {
              doc: 'String between 8 to 128 character',
              type: 'password',
              htmlElement: {
                el: 'input',
              },
            },
            kv: true,
            k: 'password',
          },
          {
            type: 'mnemonic',
            value: {
              doc: 'Mnemonic phrase',
              type: 'mnemonic',
              htmlElement: {
                el: 'input',
              },
            },
            kv: true,
            k: 'mnemonic',
          },
        ],
      },
      {
        type: 'map',
        children: [
          {
            type: 'string',
            value: {
              doc: 'String between 8 to 128 character',
              type: 'password',
              htmlElement: {
                el: 'input',
              },
            },
            kv: true,
            k: 'password',
          },
          {
            type: 'privateKey',
            value: {
              doc: '0x-prefixed private key',
              type: 'privateKey',
              htmlElement: {
                el: 'input',
              },
            },
            kv: true,
            k: 'privateKey',
          },
        ],
      },
      {
        type: 'map',
        children: [
          {
            type: 'string',
            value: {
              doc: 'String between 8 to 128 character',
              type: 'password',
              htmlElement: {
                el: 'input',
              },
            },
            kv: true,
            k: 'password',
          },
          {
            type: 'or',
            children: [
              {
                type: 're',
                value: {
                  doc:
                    '0x-prefixed address, confrom to regex /^0x[0-9a-fA-F]{40}$/',
                  type: 're',
                  htmlElement: {
                    el: 'input',
                  },
                },
              },
              {
                type: 'base32Address-1029-user',
                value: {
                  doc:
                    "Conflux base32 address with 'user' type and networkId is 1029",
                  type: 'base32Address-1029-user',
                  htmlElement: {
                    el: 'input',
                  },
                },
              },
              {
                type: 'base32Address-1-user',
                value: {
                  doc:
                    "Conflux base32 address with 'user' type and networkId is 1",
                  type: 'base32Address-1-user',
                  htmlElement: {
                    el: 'input',
                  },
                },
              },
            ],
            kv: true,
            k: 'address',
          },
        ],
      },
    ],
  },
  rpcName: 'wallet_addVault',
}

export const wallet_createAccount = Template.bind({})
wallet_createAccount.args = {
  parameters: {
    type: 'map',
    children: [
      {
        type: 'integer?',
        value: {
          doc: 'natural number, id of vault in database',
          type: 'integer?',
          htmlElement: {
            el: 'input',
            type: 'number',
          },
        },
        kv: true,
        k: 'vaultId',
      },
      {
        type: 'true?',
        value: {
          doc:
            'only create 0x1-prefixed account(both in conflux and ethereum-like chains) if specify true',
          optional: true,
          type: 'true?',
          htmlElement: {
            el: 'input',
            type: 'checkbox',
          },
        },
        kv: true,
        k: 'only0x1Prefixed',
      },
      {
        type: 'string',
        value: {
          doc:
            'hd wallet derivation path without the last address_index, check https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#abstract for detail',
          optional: true,
          type: 'string',
          htmlElement: {
            el: 'input',
          },
        },
        kv: true,
        k: 'hdPath',
      },
    ],
  },
  rpcName: 'wallet_createAccount',
}
