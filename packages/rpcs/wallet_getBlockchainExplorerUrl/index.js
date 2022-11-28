import {
  or,
  map,
  base32UserAddress,
  base32ContractAddress,
  ethHexAddress,
  Bytes32,
  zeroOrMore,
} from '@fluent-wallet/spec'
import {ENS} from '@fluent-wallet/did'

console.info('ENS====', ENS)

export const NAME = 'wallet_getBlockchainExplorerUrl'

export const schemas = {
  input: [
    map,
    {closed: true},
    [
      'address',
      {optional: true},
      [zeroOrMore, [or, base32UserAddress, ethHexAddress]],
    ],
    [
      'contract',
      {optional: true},
      [zeroOrMore, [or, base32ContractAddress, ethHexAddress]],
    ],
    [
      'token',
      {optional: true},
      [zeroOrMore, [or, base32ContractAddress, ethHexAddress]],
    ],
    ['transaction', {optional: true}, [zeroOrMore, Bytes32]],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = ({
  params: {address = [], contract = [], token = [], transaction = []},
  network,
}) => {
  const {scanUrl} = network
  const to = {
    address: addr => `${scanUrl}/address/${addr}`,
    contract: addr => `${scanUrl}/contract/${addr}`,
    token: addr => `${scanUrl}/token/${addr}`,
    transaction: txhash => `${scanUrl}/tx/${txhash}`,
  }

  return {
    address: address.map(to.address),
    contract: contract.map(to.contract),
    token: token.map(to.token),
    transaction: transaction.map(to.transaction),
  }
}
