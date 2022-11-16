export * as validation from './validation.js'
import {Conflux} from 'js-conflux-sdk'
import {CNS} from '@web3identity/web3ns'
const cfxClient = new Conflux()
cfxClient.provider = window.conflux
export const cns = new CNS({
  client: cfxClient,
  registryAddress: 'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm',
  reverseRegistrarAddress: 'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5',
  baseRegistrarAddress: 'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g',
  web3ControllerAddress: 'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk',
  nameWrapperAddress: 'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5',
  publicResolverAddress: 'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj',
})

export const getName = address => {
  return cns.getName(address)
}

export const getAddress = (name, coinId) => {
  return cns.name(name).getAddress(coinId)
}
