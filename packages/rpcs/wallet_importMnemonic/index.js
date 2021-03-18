import {mnemonic, map, password} from '@cfxjs/spec'

export const NAME = 'wallet_importMnemonic'

export const permissions = {
  methods: ['wallet_verifyPassword', 'wallet_getMnemonics'],
  store: {
    write: true,
    read: true,
  },
}

export const schema = {
  input: [map, {closed: true}, ['mnemonic', mnemonic], ['password', password]],
}

export const main = async ({
  params: {mnemonic, password},
  rpcs: {wallet_verifyPassword, wallet_getMnemonics},
  setWalletState,
}) => {
  const mnemonics = await wallet_getMnemonics()
  if (await wallet_verifyPassword(password)) {
    // TODO: encrypt mnemonic with password
    mnemonics.push(mnemonic)
    setWalletState({credentials: {mnemonics: mnemonics.slice()}})
  }
}
