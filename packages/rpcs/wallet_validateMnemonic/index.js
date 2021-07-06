import {map, stringp} from '@cfxjs/spec'

import {wordlists, validateMnemonic} from 'bip39'

export const NAME = 'wallet_validateMnemonic'

export const schemas = {
  input: [map, {closed: true}, ['mnemonic', [stringp, {min: 1}]]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

function getWordListByWord(word) {
  for (const lang in wordlists) {
    if (wordlists[lang]?.includes(word)) return lang
  }
}

export const main = ({params: {mnemonic}}) => {
  const words = mnemonic
    .split(' ')
    .map(w => w?.trim())
    .filter(w => Boolean(w))

  const lang = getWordListByWord(words[0])

  if (!lang) return {valid: false, invalidWord: words[0]}

  const wordlist = wordlists[lang]

  for (let i = 0; i < words.length; i++) {
    if (!wordlist.includes(words[i]))
      return {valid: false, invalidWord: words[i]}
  }

  return {valid: validateMnemonic(mnemonic, wordlist)}
}
