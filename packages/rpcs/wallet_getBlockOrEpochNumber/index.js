import {or} from '@fluent-wallet/spec'
import {schemas as ethSchema} from '@fluent-wallet/eth_block-number'
import {schemas as cfxSchema} from '@fluent-wallet/cfx_epoch-number'

export const NAME = 'wallet_getBlockOrEpochNumber'

export const schemas = {
  input: [or, ethSchema.input, cfxSchema.input],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_epochNumber', 'eth_blockNumber'],
  db: [],
}

export const main = ({
  network,
  rpcs: {eth_blockNumber, cfx_epochNumber},
  params,
}) => {
  if (network.type === 'cfx') {
    if (params[0] === 'latest') params[0] = 'latest_state'
    else if (params[0] === 'pending') params[0] = 'latest_mined'
    return cfx_epochNumber(params)
  }

  if (params[0] === 'latest_state') params[0] = 'latest'
  else if (params[0] === 'latest_confirmed') params[0] = 'latest'
  else if (params[0] === 'latest_finalized') params[0] = 'latest'
  else if (params[0] === 'latest_mined') params[0] = 'pending'
  else if (params[0] === 'latest_checkpoint') params[0] = 'earliest'
  return eth_blockNumber(params)
}
