import perms from './permissions.js'
import docs from './docs.js'

export const generateSchema = spec => {
  const {mapp, map, and, empty, or} = spec
  const emptyMap = [and, mapp, empty]

  // prettier-ignore
  const base = [
      map,
      {closed: true},
      ['wallet_basic',
       {optional: true, doc: docs.wallet_basic?.en || `wallet_basic wallet permission`},
       emptyMap],
      ['wallet_crossNetworkTypeGetConfluxBase32Address',
       {optional: true, doc: docs.wallet_crossNetworkTypeGetConfluxBase32Address?.en || `wallet_crossNetworkTypeGetConfluxBase32Address wallet permission`},
       emptyMap,],
      ['wallet_crossNetworkTypeGetEthereumHexAddress',
       {optional: true, doc: docs.wallet_crossNetworkTypeGetEthereumHexAddress?.en || `wallet_crossNetworkTypeGetEthereumHexAddress wallet permission`},
       emptyMap,],
    ]

  // prettier-ignore
  return [
    or,
    [
      ...base,
      ['cfx_accounts',{ doc: docs.cfx_accounts?.en || `cfx_accounts wallet permission`},  emptyMap],
      ['eth_accounts', {optional: true, doc: docs.eth_accounts?.en || `eth_accounts wallet permission`}, emptyMap],
      ['wallet_accounts', {optional: true, doc: docs.wallet_accounts?.en || `wallet_accounts wallet permission`}, emptyMap],
    ],
    [
            ...base,
      ['cfx_accounts',{optional: true,  doc: docs.cfx_accounts?.en || `cfx_accounts wallet permission`},  emptyMap],
      ['eth_accounts', {doc: docs.eth_accounts?.en || `eth_accounts wallet permission`}, emptyMap],
      ['wallet_accounts', {optional: true, doc: docs.wallet_accounts?.en || `wallet_accounts wallet permission`}, emptyMap],
    ],
    [
      ...base,
      ['cfx_accounts',{optional: true,  doc: docs.cfx_accounts?.en || `cfx_accounts wallet permission`},  emptyMap],
      ['eth_accounts', {optional: true, doc: docs.eth_accounts?.en || `eth_accounts wallet permission`}, emptyMap],
      ['wallet_accounts', {doc: docs.wallet_accounts?.en || `wallet_accounts wallet permission`}, emptyMap],
    ]
  ]
}

export default perms
