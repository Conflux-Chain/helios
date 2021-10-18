// import js-conflux-sdk
// more info about js-conflux-sdk
// https://github.com/Conflux-Chain/js-conflux-sdk#readme
// eslint-disable-next-line import/no-unresolved
// import {Conflux} from 'https://cdn.skypack.dev/js-conflux-sdk'

function getElement(id) {
  return document.getElementById(id)
}

function isFluentInstalled() {
  return Boolean(window?.cfx?.isFluent)
}

function walletInitialized({chainId, networkId}) {
  const provider = window.cfx
  getElement('initialized').innerHTML = 'initialized'
  getElement('chainId').innerHTML = chainId
  getElement('networkId').innerHTML = networkId

  // connect
  const connectButton = getElement('connect')
  const personalSignButton = getElement('personal_sign')
  const typedSignButton = getElement('typed_sign')
  const addNetworkButton = getElement('add_network')
  const switchNetworkButton = getElement('switch_network')
  connectButton.disabled = false
  connectButton.onclick = () => {
    provider
      .request({
        method: 'cfx_requestAccounts',
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
        getElement('address').innerHTML = res.result
        console.log('result', res.result)
        personalSignButton.disabled = false
        typedSignButton.disabled = false
        addNetworkButton.disabled = false
        switchNetworkButton.disabled = false
      })
  }

  // personal sign
  personalSignButton.onclick = () => {
    provider
      .request({
        method: 'personal_sign',
        params: [
          'personal sign message example',
          getElement('address').innerHTML,
        ],
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
        getElement('personal_sign_result').innerHTML = res.result
        console.log('result', res.result)
      })
  }

  // typed sign
  const typedData = {
    types: {
      CIP23Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      Person: [
        {name: 'name', type: 'string'},
        {name: 'wallets', type: 'address[]'},
      ],
      Mail: [
        {name: 'from', type: 'Person'},
        {name: 'to', type: 'Person[]'},
        {name: 'contents', type: 'string'},
      ],
      Group: [
        {name: 'name', type: 'string'},
        {name: 'members', type: 'Person[]'},
      ],
    },
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
      contents: 'Hello, Bob!',
    },
  }
  typedSignButton.onclick = () => {
    provider
      .request({
        method: 'cfx_signTypedData_v4',
        params: [getElement('address').innerHTML, JSON.stringify(typedData)],
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
        getElement('typed_sign_result').innerHTML = res.result
        console.log('result', res.result)
      })
  }

  addNetworkButton.onclick = () => {
    provider
      .request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xa4b1',
            chainName: 'Arbitrum One',
            nativeCurrency: {
              name: 'Arbitrum Ether',
              symbol: 'AETH',
              decimals: 18,
            },
            rpcUrls: ['https://arb1.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://arbiscan.io'],
          },
        ],
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
        console.log('result', res.result)
      })
  }

  switchNetworkButton.onclick = () => {
    provider
      .request({
        method: 'wallet_switchConfluxChain',
        params: [{chainId: '0x1'}],
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
        provider
          .request({method: 'cfx_chainId'})
          .then(res => (getElement('chainId').innerHTML = res.result))
        provider
          .request({method: 'cfx_netVersion'})
          .then(res => (getElement('networkId').innerHTML = res.result))
        console.log('result', res.result)
      })
  }
}

window.addEventListener('load', () => {
  if (!isFluentInstalled()) {
    return
  }

  getElement('installed').innerHTML = 'installed'
  window.cfx.on('connect', walletInitialized)
})
