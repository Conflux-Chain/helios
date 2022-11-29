// export * as validation from './validation.js'
// import {Conflux} from 'js-conflux-sdk'
// import {CNS, namehash, Web3Domain} from '@web3identity/web3ns'
// import {formatsByCoinType} from '@web3identity/address-encoder'
// import {COINID_CONFLUX} from '../constant.js'

// const cfxClient = new Conflux()
// cfxClient.provider = window.conflux

// //TODO add env
// const isProduction = false
// export const REGISTRY_ADDRESS = isProduction
//   ? 'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm'
//   : 'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm'
// export const REVERSE_REGISTRAR_ADDRESS = isProduction
//   ? 'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5'
//   : 'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5'
// export const BASE_REGISTRAR_ADDRESS = isProduction
//   ? 'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g'
//   : 'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g'
// export const WEB3_CONTROLLER_ADDRESS = isProduction
//   ? 'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk'
//   : 'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk'
// export const NAME_WRAPPER_ADDRESS = isProduction
//   ? 'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5'
//   : 'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5'
// export const PUBLIC_RESOLVER_ADDRESS = isProduction
//   ? 'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'
//   : 'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'

// export const cns = new CNS({
//   client: cfxClient,
//   registryAddress: REVERSE_REGISTRAR_ADDRESS,
//   reverseRegistrarAddress: REVERSE_REGISTRAR_ADDRESS,
//   baseRegistrarAddress: BASE_REGISTRAR_ADDRESS,
//   web3ControllerAddress: WEB3_CONTROLLER_ADDRESS,
//   nameWrapperAddress: NAME_WRAPPER_ADDRESS,
//   publicResolverAddress: PUBLIC_RESOLVER_ADDRESS,
// })

// export const web3domain = new Web3Domain({
//   client: cfxClient,
//   registryAddress: REVERSE_REGISTRAR_ADDRESS,
//   reverseRegistrarAddress: REVERSE_REGISTRAR_ADDRESS,
//   baseRegistrarAddress: BASE_REGISTRAR_ADDRESS,
//   web3ControllerAddress: WEB3_CONTROLLER_ADDRESS,
//   nameWrapperAddress: NAME_WRAPPER_ADDRESS,
//   publicResolverAddress: PUBLIC_RESOLVER_ADDRESS,
// })

// export const getName = address => {
//   return cns.getName(address)
// }

// export const getAddress = name => {
//   return cns.name(name).getAddress(COINID_CONFLUX)
// }

// export const getNames = async addresses => {
//   const encodedList = []
//   addresses.map(address => {
//     const encoded = _getNameEncodedData(address)
//     encodedList.push(encoded)
//   })
//   const namesList = {}
//   const response = await web3domain.PublicResolver.multicall(encodedList)
//   response.map((item, index) => {
//     namesList[addresses[index]] = item.toString('hex')
//   })
//   return namesList
// }

// export const getAddresses = async names => {
//   const coinTypeInstance = formatsByCoinType[COINID_CONFLUX]
//   const inputCoinType = coinTypeInstance.coinType
//   const encodedList = []
//   names.map(name => {
//     const encodeData = web3domain.PublicResolver[
//       'addr(bytes32,uint256)'
//     ].encodeData([namehash(name), inputCoinType])
//     encodedList.push(encodeData)
//   })
//   const response = await web3domain.PublicResolver.multicall(encodedList)
//   const addressList = {}
//   response.map((item, index) => {
//     const decoded = web3domain.PublicResolver[
//       'addr(bytes32,uint256)'
//     ].decodeOutputs(item.toString('hex'))
//     const address = coinTypeInstance.encoder(decoded)
//     addressList[names[index]] = address
//   })
//   return addressList
// }

// function _getNameEncodedData(address) {
//   const reverseStr = address.slice(2) + '.addr.reverse'
//   const nh = namehash(reverseStr)
//   const encodeData = web3domain.PublicResolver.name.encodeData([nh])
//   return encodeData
// }
