import {isString} from '@cfxjs/checks'

export const INITIAL_STORE = (set, get) => ({
  theme: 'light',
  setTheme: theme => isString(theme) && set({theme}),

  // directly call provider.request
  r: req => window?.___CFXJS_USE_RPC__PRIVIDER?.request(req),

  // helper fn for write rpc methods (method that will write to wallet db or to the blockchain)
  generatePrivateKey: () => get().r({method: 'wallet_generatePrivateKey'}),
  generateMnemonic: () => get().r({method: 'wallet_generateMnemonic'}),
  getHdAccountGroup: () =>
    get().group?.groupData.filter(group => group.vault.type === 'hd'),
  validateMnemonic: async mnemonic =>
    isString(mnemonic) &&
    (await get().r({method: 'wallet_validateMnemonic', params: {mnemonic}})
      .result),
})
