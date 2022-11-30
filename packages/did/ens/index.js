import ENSRegistryWithFallback from './abi/ENSRegistryWithFallback.json'
import Resolver from './abi/Resolver.json'
import PublicResolver from './abi/PublicResolver.json'
import Web3 from 'web3'
import {hash} from '@ensdomains/eth-ens-namehash'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default class ENS {
  provider = null
  web3 = null
  ens = null
  PublicResolverContract
  ENSRegistryWithFallbackContract
  constructor(provider) {
    if (!provider) throw new Error('The provider is required')
    this.web3 = new Web3(provider)
    this.ens = this.web3.eth.ens
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
      const resolverContract = this.getResolverContract(resoverAddress)
      const nameResult = await resolverContract.methods.name(hashStr).call()
      return nameResult.toString('hex')
    } catch (error) {
      return ''
    }
  }

  async getAddress(name) {
    try {
      const address = await this.ens.getAddress(name)
      return address
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
    const nameEncodedList = []
    names.map(name => {
      const nhItem = hash(name)
      nameEncodedList.push(
        this.PublicResolverContract.methods.addr(nhItem).encodeABI(),
      )
    })
    const addresses = {}
    try {
      const res = await this.PublicResolverContract.methods
        .multicall(nameEncodedList)
        .call()
      res.map((item, index) => {
        let address = this.web3.eth.abi.decodeParameter(
          'address',
          item.toString('hex'),
        )
        if (address == ZERO_ADDRESS) address = ''
        addresses[names[index]] = address
      })
    } catch (error) {
      console.warn(error)
    }

    return addresses
  }

  _initContract() {
    this.PublicResolverContract = new this.web3.eth.Contract(
      PublicResolver,
      '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    )
    this.ENSRegistryWithFallbackContract = new this.web3.eth.Contract(
      ENSRegistryWithFallback,
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    )
  }

  getResolverContract(address) {
    return new this.web3.eth.Contract(Resolver, address)
  }
}
