import {
  CONFLUX_MAINNET_RPC_ENDPOINT,
  CFX_MAINNET_NAME,
  CONFLUX_TESTNET_RPC_ENDPOINT,
  CFX_TESTNET_NAME,
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_MAINNET_NAME,
  ETH_ROPSTEN_RPC_ENDPOINT,
  ETH_ROPSTEN_NAME,
  BSC_MAINNET_RPC_ENDPOINT,
  BSC_MAINNET_NAME,
  BSC_TESTNET_RPC_ENDPOINT,
  BSC_TESTNET_NAME,
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
} from '@cfxjs/fluent-wallet-consts'

function initNetwork(d) {
  if (d.getNetwork().length) return

  d.createNetwork({
    nickname: CFX_MAINNET_NAME,
    endpoint: CONFLUX_MAINNET_RPC_ENDPOINT,
    type: 'cfx',
    hdpath: DEFAULT_CFX_HDPATH,
  })

  d.createNetwork({
    nickname: CFX_TESTNET_NAME,
    endpoint: CONFLUX_TESTNET_RPC_ENDPOINT,
    type: 'cfx',
    hdpath: DEFAULT_CFX_HDPATH,
  })

  d.createNetwork({
    nickname: ETH_MAINNET_NAME,
    endpoint: ETH_MAINNET_RPC_ENDPOINT,
    type: 'eth',
    hdpath: DEFAULT_ETH_HDPATH,
  })

  d.createNetwork({
    nickname: ETH_ROPSTEN_NAME,
    endpoint: ETH_ROPSTEN_RPC_ENDPOINT,
    type: 'eth',
    hdpath: DEFAULT_ETH_HDPATH,
  })

  d.createNetwork({
    nickname: BSC_MAINNET_NAME,
    endpoint: BSC_MAINNET_RPC_ENDPOINT,
    type: 'eth',
    hdpath: DEFAULT_ETH_HDPATH,
  })

  d.createNetwork({
    nickname: BSC_TESTNET_NAME,
    endpoint: BSC_TESTNET_RPC_ENDPOINT,
    type: 'eth',
    hdpath: DEFAULT_ETH_HDPATH,
  })
}

export default function initDB(d) {
  initNetwork(d)
}
