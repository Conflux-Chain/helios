import ENSRegistryWithFallback from './abi/ENSRegistryWithFallback.json'
import Resolver from './abi/Resolver.json'
import PublicResolver from './abi/PublicResolver.json'
import Web3 from 'web3'
import {hash} from '@ensdomains/eth-ens-namehash'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ethereum = window['ethereum']
export const web3 = new Web3(ethereum)
export const ens = web3.eth.ens
export const PublicResolverContract = new web3.eth.Contract(
  PublicResolver,
  '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
)
export const ENSRegistryWithFallbackContract = new web3.eth.Contract(
  ENSRegistryWithFallback,
  '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
)

export const getName = async address => {
  try {
    address = address.toLowerCase()
    const reverseStr = address.slice(2) + '.addr.reverse'
    const hashStr = hash(reverseStr)
    const resoverAddress = await ENSRegistryWithFallbackContract.methods
      .resolver(hashStr)
      .call()
    const resolverContract = getResolverContract(resoverAddress)
    const nameResult = await resolverContract.methods.name(hashStr).call()
    return nameResult.toString('hex')
  } catch (error) {
    return ''
  }
}

export const getAddress = name => {
  return ens.getAddress(name)
}

export const getNames = async addresses => {
  const proArr = []
  addresses.map(address => {
    proArr.push(getName(address))
  })
  const names = await Promise.all(proArr)
  const nameList = {}
  names.map((name, index) => {
    nameList[addresses[index]] = name
  })
  return nameList
}

export const getAddresses = async names => {
  const nameEncodedList = []
  names.map(name => {
    const nhItem = hash(name)
    nameEncodedList.push(
      PublicResolverContract.methods.addr(nhItem).encodeABI(),
    )
  })
  const res = await PublicResolverContract.methods
    .multicall(nameEncodedList)
    .call()
  const addresses = {}
  res.map((item, index) => {
    let address = web3.eth.abi.decodeParameter('address', item.toString('hex'))
    if (address != ZERO_ADDRESS) address = ''
    addresses[names[index]] = address
  })
  return addresses
}

export const getResolverContract = address => {
  return new web3.eth.Contract(Resolver, address)
}
