import {RPC_METHODS} from '../constants'
import {request} from './index'

const {WALLET_VALIDATE_20TOKEN} = RPC_METHODS

export const get20Token = value => {
  request(WALLET_VALIDATE_20TOKEN, {
    tokenAddress: value,
  }).then(({result}) => {
    return result
  })
}
