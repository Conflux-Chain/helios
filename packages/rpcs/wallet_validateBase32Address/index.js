import {validateBase32Address} from '@cfxjs/base32-address'
import {
  or,
  addressType,
  map,
  string,
  networkId,
  dbid,
  boolean,
} from '@cfxjs/spec'

export const NAME = 'wallet_validateBase32Address'

const baseSchema = [
  map,
  {closed: true},
  ['address', string],
  ['type', {optional: true}, addressType],
]

const withNetworkIdSchema = [
  ...baseSchema,
  ['networkId', {optional: true}, networkId],
]
const withNetworkDBIDSchema = [
  ...baseSchema,
  ['networkDBID', {optional: true, doc: 'db entity id of network'}, dbid],
]
const withoutNetIdSchema = [
  ...baseSchema,
  [
    'skipNetworkValidation',
    {
      optional: true,
      doc: 'use this to skip validation against the request network',
    },
    boolean,
  ],
]

export const schemas = {
  input: [or, withNetworkIdSchema, withNetworkDBIDSchema, withoutNetIdSchema],
}

export const permissions = {
  db: ['getOneNetwork'],
}

export const main = ({
  params: {address, type, networkId, networkDBID, skipNetworkValidation},
  db: {getOneNetwork},
  networkName,
}) => {
  let netId = networkId ?? getOneNetwork({id: networkDBID})?.networkId

  if (!skipNetworkValidation)
    netId = netId ?? getOneNetwork({name: networkName})?.networkId

  return validateBase32Address(address, type, netId)
}
