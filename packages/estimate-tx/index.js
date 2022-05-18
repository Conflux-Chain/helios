import {cfxEstimate, cfxGetFeeData} from './cfx.js'
import {ethEstimate, ethGetFeeData} from './eth.js'
export {cfxEstimate, cfxGetFeeData} from './cfx.js'
export {ethEstimate, ethGetFeeData} from './eth.js'

export const estimate = (tx, opts) => {
  let {type} = opts
  type = type || 'cfx'
  if (type === 'cfx') {
    return cfxEstimate(tx, opts)
  }
  return ethEstimate(tx, opts)
}

export const getFeeData = (tx, opts) => {
  let {type} = opts
  type = type || 'cfx'
  if (type === 'cfx') {
    return cfxGetFeeData(tx, opts)
  }
  return ethGetFeeData(tx, opts)
}
