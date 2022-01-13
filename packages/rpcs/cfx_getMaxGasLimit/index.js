import {optParam} from '@fluent-wallet/spec'
import {BigNumber} from '@ethersproject/bignumber'

export const NAME = 'cfx_getMaxGasLimit'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['cfx_getBestBlockHash', 'cfx_getBlockByHash'],
}

export const main = ({rpcs: {cfx_getBestBlockHash, cfx_getBlockByHash}}) => {
  return cfx_getBestBlockHash()
    .then(hash => cfx_getBlockByHash([hash, false]))
    .then(block => block.gasLimit)
    .then(gasLimit => BigNumber.from(gasLimit).div(2).toHexString())
}
