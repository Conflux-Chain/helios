import {normalize} from 'eth-ens-namehash'
import {address} from 'js-conflux-sdk'

export function isEncodedLabelhash(hash) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
}

export function validateName(name) {
  const nameArray = name.split('.')
  const hasEmptyLabels = nameArray.filter(e => e.length < 1).length > 0
  if (hasEmptyLabels) throw new Error('Domain cannot have empty labels')
  const normalizedArray = nameArray.map(label => {
    return isEncodedLabelhash(label) ? label : normalize(label)
  })
  // eslint-disable-next-line no-useless-catch
  try {
    return normalizedArray.join('.')
  } catch (e) {
    throw e
  }
}

export const validateTLD = name => {
  const labels = name.split('.')
  return validateName(labels[labels.length - 1])
}

export const parseSearchinput = input => {
  let regex = /[^.]+$/
  const validTLD = validateTLD(input)
  try {
    validateName(input)
  } catch (e) {
    return 'invalid'
  }

  if (input.indexOf('.') !== -1) {
    const tld = input.match(regex) ? input.match(regex)[0] : ''
    if (validTLD && tld === 'web3') {
      return 'supported'
    }

    return 'unsupported'
  } else if (address.isValidCfxAddress(input)) {
    return 'address'
  } else {
    //check if the search input is actually a tld
    if (validTLD) {
      return 'tld'
    }
    return 'search'
  }
}
