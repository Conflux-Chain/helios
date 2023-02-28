export * as validation from './validation.js'
import {Conflux} from 'js-conflux-sdk'
import {hash} from '@ensdomains/eth-ens-namehash'
import {
  encode as encodeCfxAddress,
  decode as decodeCfxAddress,
} from '@fluent-wallet/base32-address'

import {
  COINID_CONFLUX,
  CHAINID_CFX_MAINNET,
  CHAINID_CFX_TESTNET,
} from '../constant.js'
import PublicResolver_ABI from './abis/PublicResolver.json'
import ENS_ABI from './abis/ENS.json'
import ReverseRecord_ABI from './abis/ReverseRecords.json'

export default class CNS {
  provider = null
  cfxClient = null
  chainId = 1029
  PublicResolver
  Registry
  ReverseRecord
  constructor(provider, chainId) {
    this._check(provider, chainId)
    this.provider = provider
    this.cfxClient = new Conflux()
    this.cfxClient.provider = provider
    this.chainId = chainId
    this._initContract(chainId)
  }

  setProvider(provider, chainId) {
    this._check(provider, chainId)
    this.provider = provider
    if (!this.cfxClient) this.cfxClient = new Conflux()
    this.cfxClient.provider = provider
    this.chainId = chainId
    this._initContract(this.chainId)
  }

  async getName(address) {
    try {
      const name = await this.ReverseRecord.getNames([address])
      return name?.[0] || ''
    } catch (error) {
      console.warn(`Error getting name for reverse record of ${address}`, error)
      return ''
    }
  }

  async getAddress(name) {
    const nh = hash(name)
    try {
      const resolverAddr = await this.Registry.resolver(nh)
      const resolverContract = this._getResolverContract(resolverAddr)
      const addr = await resolverContract.addr(nh, COINID_CONFLUX)
      return encodeCfxAddress(addr, this.chainId)
    } catch (error) {
      console.warn('Error getting addr on the resolver contract')
      return ''
    }
  }

  async getNames(addresses) {
    const ret = {}
    try {
      const names = await this.ReverseRecord.getNames([...addresses])
      names.forEach((name, index) => {
        ret[addresses[index]] = name
      })
    } catch (error) {
      console.warn(error)
    }
    return ret
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
      const address = encodeCfxAddress(decoded, this.chainId)
      addressList[names[index]] = address
    })
    return addressList
  }

  _getResolverContract(address) {
    if (!address) return this.PublicResolver
    return this.cfxClient.Contract({
      abi: PublicResolver_ABI,
      address: encodeCfxAddress(address, this.chainId),
    })
  }

  _getNameEncodedData(address) {
    const reverseStr =
      decodeCfxAddress(address).hexAddress.slice(2) + '.addr.reverse'
    const nh = hash(reverseStr)
    const encodeData = this.PublicResolver.name.encodeData([nh])
    return encodeData
  }

  _initContract(chainId) {
    const isMainnet = chainId == CHAINID_CFX_MAINNET
    //TODO：add mainnet address
    const REGISTRY_ADDRESS = isMainnet
      ? 'cfx:acemru7fu1u8brtyn3hrtae17kbcd4pd9uwbspvnnm'
      : 'cfxtest:acemru7fu1u8brtyn3hrtae17kbcd4pd9u2m761bta'
    const REVERSE_RECORD_ADDRESS = isMainnet
      ? 'cfx:achsgpgs5dgpmgpj2zd87apj6js33c07pjth6k33mj'
      : 'cfxtest:acgddsj3kah2f4f4c6959bvc4732f4juyj90h0zmg2'

    const PUBLIC_RESOLVER_ADDRESS = isMainnet
      ? 'cfx:acasaruvgf44ss67pxzfs1exvj7k2vyt863f72n6up'
      : 'cfxtest:acbfyf69zaxau5a23w10dgyrmb0hrz4p9pewn6sejp'

    this.PublicResolver = this.cfxClient.Contract({
      abi: PublicResolver_ABI,
      address: PUBLIC_RESOLVER_ADDRESS,
    })
    this.Registry = this.cfxClient.Contract({
      abi: ENS_ABI,
      address: REGISTRY_ADDRESS,
    })
    this.ReverseRecord = this.cfxClient.Contract({
      abi: ReverseRecord_ABI,
      address: REVERSE_RECORD_ADDRESS,
    })
  }

  _check(provider, chainId) {
    if (!provider) throw new Error('The provider is required')
    if (![CHAINID_CFX_MAINNET, CHAINID_CFX_TESTNET].includes(chainId))
      throw new Error('Only support 1029 and 1')
  }
}
