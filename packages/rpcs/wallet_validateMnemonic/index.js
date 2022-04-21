import {map, stringp} from '@fluent-wallet/spec'
import {wordlists, validateMnemonic} from 'bip39'

export const NAME = 'wallet_validateMnemonic'

export const schemas = {
  input: [map, {closed: true}, ['mnemonic', [stringp, {min: 1}]]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

function filterWordlistsByWord(wordlists, word) {
  if (typeof wordlists === 'string') return wordlists
  wordlists = wordlists.filter(([, list]) => list.includes(word))
  if (!wordlists.length) return word
  return wordlists
}

export const main = ({params: {mnemonic}}) => {
  const words = mnemonic
    .split(' ')
    .map(w => w?.trim())
    .filter(w => Boolean(w))

  const validWordlistsOrInvalidWord = words.reduce(
    filterWordlistsByWord,
    Object.entries(wordlists),
  )

  if (typeof validWordlistsOrInvalidWord === 'string')
    return {valid: false, invalidWord: validWordlistsOrInvalidWord}

  const invalids = validWordlistsOrInvalidWord.reduce((acc, [lang, list]) => {
    if (!validateMnemonic(mnemonic, list)) return acc.concat([lang])
    return acc.concat([false])
  }, [])

  if (invalids.every(x => !!x))
    return {valid: false, invalidWordlists: invalids}

  return {valid: true}
}
