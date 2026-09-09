import {decode} from '@fluent-wallet/base32-address'
import {isFunction} from '@fluent-wallet/checks'
import {EIP7702_DELEGATION_PREFIX} from '@fluent-wallet/consts'

const EIP7702_DELEGATION_CODE_LENGTH = EIP7702_DELEGATION_PREFIX.length + 40

export const getEip7702DelegateAddressFromCode = code => {
  const lowerCaseCode = code.toLowerCase()

  if (
    lowerCaseCode.length !== EIP7702_DELEGATION_CODE_LENGTH ||
    !lowerCaseCode.startsWith(EIP7702_DELEGATION_PREFIX)
  ) {
    return null
  }

  return `0x${lowerCaseCode.slice(EIP7702_DELEGATION_PREFIX.length)}`
}

export const detectCfxAddressType = async address => {
  const isBase32 = address.includes(':')

  if (isBase32) {
    const type = decode(address).type
    return {type, [type]: true}
  }

  throw new Error(`don't support detect hex address with cfx network`)
}

export const detectEthAddressType = async (address, {request} = {}) => {
  if (!isFunction(request)) throw new Error('opts.request is not a function')

  let code
  try {
    code = await request({method: 'eth_getCode', params: [address]})
  } catch (err) {} // eslint-disable-line no-empty

  if (!code || code === '0x') {
    return {
      type: 'unknown',
      contract: false,
      eip7702Delegated: false,
      delegateAddress: null,
    }
  }

  const delegateAddress = getEip7702DelegateAddressFromCode(code)

  return {
    type: 'contract',
    contract: true,
    eip7702Delegated: Boolean(delegateAddress),
    delegateAddress,
  }
}

export const detectAddressType = async (address, opts = {}) => {
  if (opts.type === 'cfx') return await detectCfxAddressType(address)
  if (opts.type === 'eth') return await detectEthAddressType(address, opts)
  throw new Error(`Invalid opts.type ${opts.type}, must be one of cfx or eth`)
}
