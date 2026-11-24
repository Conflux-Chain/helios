import ENSRegistryWithFallback from './abi/ENSRegistryWithFallback.json'
import Resolver from './abi/Resolver.json'
import {Interface} from '@ethersproject/abi'
import {
  JsonRpcProvider,
  Web3Provider,
  WebSocketProvider,
} from '@ethersproject/providers'
import {hash} from '@ensdomains/eth-ens-namehash'

const registry = new Interface(ENSRegistryWithFallback)
const resolver = new Interface(Resolver)
const registryAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

// Use the injected provider directly. For URLs and legacy transports, only
// send raw RPC calls; do not use the adapter's network for ENS resolution.
function getRequest(provider) {
  if (typeof provider.request === 'function')
    return params => provider.request(params)
  const rpc =
    typeof provider === 'string'
      ? /^wss?:\/\//i.test(provider)
        ? new WebSocketProvider(provider, 1)
        : new JsonRpcProvider(provider, 1)
      : new Web3Provider(provider, 1)
  return ({method, params}) => rpc.send(method, params)
}

export default class ENS {
  constructor(provider) {
    if (!provider) throw new Error('The provider is required')
    this.provider = provider
    this.request = getRequest(provider)
  }

  async _call(abi, to, method, node) {
    const data = abi.encodeFunctionData(method, [node])
    const response = await this.request({
      method: 'eth_call',
      params: [{to, data}, 'latest'],
    })
    const [value] = abi.decodeFunctionResult(
      method,
      response?.result ?? response,
    )
    return value
  }

  async getName(address) {
    try {
      address = address.toLowerCase()
      const reverseStr = address.slice(2) + '.addr.reverse'
      const hashStr = hash(reverseStr)
      const resolverAddress = await this._call(
        registry,
        registryAddress,
        'resolver',
        hashStr,
      )
      return await this._call(resolver, resolverAddress, 'name', hashStr)
    } catch (error) {
      return ''
    }
  }

  async getAddress(name) {
    const nh = hash(name)
    try {
      const resolverAddress = await this._call(
        registry,
        registryAddress,
        'resolver',
        nh,
      )
      return await this._call(resolver, resolverAddress, 'addr(bytes32)', nh)
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
}
