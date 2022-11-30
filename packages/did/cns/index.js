export * as validation from './validation.js'
import {Conflux} from 'js-conflux-sdk'
import {hash} from '@ensdomains/eth-ens-namehash'
import {
  encode as encodeCfxAddress,
  decode as decodeCfxAddress,
} from '@fluent-wallet/base32-address'

import {COINID_CONFLUX} from '../constant.js'
// import {encodeCfxAddress} from '../addressUtils'
import PublicResolver_ABI from './abis/PublicResolver.json'
import ENS_ABI from './abis/ENS.json'
import ReverseRegistrar_ABI from './abis/ReverseRegistrar.json'

//TODO add env
const isProduction = false
const networkId = isProduction ? 1029 : 1
export const REGISTRY_ADDRESS = isProduction
  ? 'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm'
  : 'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm'
export const REVERSE_REGISTRAR_ADDRESS = isProduction
  ? 'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5'
  : 'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5'
export const BASE_REGISTRAR_ADDRESS = isProduction
  ? 'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g'
  : 'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g'
export const WEB3_CONTROLLER_ADDRESS = isProduction
  ? 'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk'
  : 'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk'
export const NAME_WRAPPER_ADDRESS = isProduction
  ? 'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5'
  : 'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5'
export const PUBLIC_RESOLVER_ADDRESS = isProduction
  ? 'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'
  : 'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'

export default class CNS {
  provider = null
  cfxClient = null
  PublicResolver
  Registry
  ReverseRegistrar
  constructor(provider) {
    if (!provider) throw new Error('The provider is required')
    this.provider = provider
    this.cfxClient = new Conflux()
    this.cfxClient.provider = provider
    this._initContract()
  }

  setProvider(provider) {
    this.provider = provider
    if (!this.cfxClient) this.cfxClient = new Conflux()
    this.cfxClient.provider = provider
    this._initContract()
  }

  async getName(address) {
    try {
      const node = await this.ReverseRegistrar.node(address)
      const name = await this.PublicResolver.name(node)
      return name
    } catch (error) {
      console.warn(`Error getting name for reverse record of ${address}`, error)
      return ''
    }
  }

  async getAddress(name) {
    const nh = hash(name)
    try {
      const resolverAddr = await this.Registry.resolver(nh)
      const resolverContract = this._getResoverContract(resolverAddr)
      const addr = await resolverContract.addr(nh, COINID_CONFLUX)
      return encodeCfxAddress(addr, networkId)
    } catch (error) {
      console.warn('Error getting addr on the resolver contract')
      return ''
    }
  }

  async getNames(addresses) {
    const encodedList = []
    addresses.map(address => {
      const encoded = this._getNameEncodedData(address)
      encodedList.push(encoded)
    })
    const namesList = {}
    const response = await this.PublicResolver.multicall(encodedList)
    response.map((item, index) => {
      const decoded = this.PublicResolver['name(bytes32)'].decodeOutputs(
        item.toString('hex'),
      )
      namesList[addresses[index]] = decoded
    })
    return namesList
  }

  async getAddresses(names) {
    const encodedList = []
    names.map(name => {
      const encodeData = this.PublicResolver[
        'addr(bytes32,uint256)'
      ].encodeData([hash(name), COINID_CONFLUX])
      encodedList.push(encodeData)
    })
    const response = await this.PublicResolver.multicall(encodedList)
    const addressList = {}
    response.map((item, index) => {
      const decoded = this.PublicResolver[
        'addr(bytes32,uint256)'
      ].decodeOutputs(item.toString('hex'))
      const address = encodeCfxAddress(decoded, networkId)
      addressList[names[index]] = address
    })
    return addressList
  }

  _getResoverContract(address) {
    if (!address) return this.PublicResolver
    return this.cfxClient.Contract({
      abi: PublicResolver_ABI,
      address: encodeCfxAddress(address, networkId),
    })
  }

  _getNameEncodedData(address) {
    const reverseStr =
      decodeCfxAddress(address).hexAddress.slice(2) + '.addr.reverse'
    const nh = hash(reverseStr)
    const encodeData = this.PublicResolver.name.encodeData([nh])
    return encodeData
  }

  _initContract() {
    this.PublicResolver = this.cfxClient.Contract({
      abi: PublicResolver_ABI,
      address: PUBLIC_RESOLVER_ADDRESS,
    })
    this.Registry = this.cfxClient.Contract({
      abi: ENS_ABI,
      address: REGISTRY_ADDRESS,
    })
    this.ReverseRegistrar = this.cfxClient.Contract({
      abi: ReverseRegistrar_ABI,
      address: REVERSE_REGISTRAR_ADDRESS,
    })
  }
}
