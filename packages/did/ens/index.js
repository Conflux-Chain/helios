import ENSRegistryWithFallback from './abi/ENSRegistryWithFallback.json'
import Resolver from './abi/Resolver.json'
import Web3EthContract from 'web3-eth-contract'
import {hash} from '@ensdomains/eth-ens-namehash'

export default class ENS {
  provider = null
  ens = null
  ENSRegistryWithFallbackContract
  constructor(provider) {
    if (!provider) throw new Error('The provider is required')
    Web3EthContract.setProvider(provider)
    this._initContract()
  }

  async getName(address) {
    try {
      address = address.toLowerCase()
      const reverseStr = address.slice(2) + '.addr.reverse'
      const hashStr = hash(reverseStr)
      const resoverAddress = await this.ENSRegistryWithFallbackContract.methods
        .resolver(hashStr)
        .call()
      const resolverContract = this._getResolverContract(resoverAddress)
      const nameResult = await resolverContract.methods.name(hashStr).call()
      return nameResult.toString('hex')
    } catch (error) {
      return ''
    }
  }

  async getAddress(name) {
    const nh = hash(name)
    try {
      const resolverAddr = await this.ENSRegistryWithFallbackContract.methods
        .resolver(nh)
        .call()
      const resolverContract = this._getResolverContract(resolverAddr)
      const addr = await resolverContract.methods.addr(nh).call()
      return addr
    } catch (error) {
      return ''
    }
  }

  async getNames(addresses) {
    const proArr = []
    addresses.map(address => {
      proArr.push(this.getName(address))
    })
    const names = await Promise.all(proArr)
    const nameList = {}
    names.map((name, index) => {
      nameList[addresses[index]] = name
    })
    return nameList
  }

  async getAddresses(names) {
    const proArr = []
    names.map(name => {
      proArr.push(this.getAddress(name))
    })
    const addresses = await Promise.all(proArr)
    const addressList = {}
    addresses.map((address, index) => {
      addressList[names[index]] = address
    })
    return addressList
  }

  _initContract() {
    this.ENSRegistryWithFallbackContract = new Web3EthContract(
      ENSRegistryWithFallback,
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    )
  }

  _getResolverContract(address) {
    return new Web3EthContract(Resolver, address)
  }
}
