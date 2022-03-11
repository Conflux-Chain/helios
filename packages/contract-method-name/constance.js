import {CFX_MAINNET_NETID, CFX_TESTNET_NETID} from '@fluent-wallet/consts'

export const ETH_FOUR_BYTE_DOMAIN = 'https://www.4byte.directory'

// ETH endpoints
export const ETH_ENDPOINT = {
  1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  3: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  4: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  42: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
}

export const CFX_SCAN_DOMAINS = {
  [CFX_MAINNET_NETID]: 'https://confluxscan.io',
  [CFX_TESTNET_NETID]: 'https://testnet.confluxscan.io',
}
