// import js-conflux-sdk
// more info about js-conflux-sdk
// https://github.com/Conflux-Chain/js-conflux-sdk#readme
// eslint-disable-next-line import/no-unresolved
import {Conflux} from 'https://cdn.skypack.dev/js-conflux-sdk'
const exampleContract = new Conflux().Contract({
  abi: [
    {
      inputs: [{internalType: 'address', name: 'tokenHolder', type: 'address'}],
      name: 'balanceOf',
      outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{internalType: 'uint8', name: '', type: 'uint8'}],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{internalType: 'string', name: '', type: 'string'}],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{internalType: 'string', name: '', type: 'string'}],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {internalType: 'address', name: 'recipient', type: 'address'},
        {internalType: 'uint256', name: 'amount', type: 'uint256'},
      ],
      name: 'transfer',
      outputs: [{internalType: 'bool', name: '', type: 'bool'}],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {internalType: 'address', name: 'holder', type: 'address'},
        {internalType: 'address', name: 'spender', type: 'address'},
      ],
      name: 'allowance',
      outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {internalType: 'address', name: 'spender', type: 'address'},
        {internalType: 'uint256', name: 'value', type: 'uint256'},
      ],
      name: 'approve',
      outputs: [{internalType: 'bool', name: '', type: 'bool'}],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'granularity',
      outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {internalType: 'address', name: 'recipient', type: 'address'},
        {internalType: 'uint256', name: 'amount', type: 'uint256'},
        {internalType: 'bytes', name: 'data', type: 'bytes'},
      ],
      name: 'send',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {internalType: 'address', name: 'holder', type: 'address'},
        {internalType: 'address', name: 'recipient', type: 'address'},
        {internalType: 'uint256', name: 'amount', type: 'uint256'},
      ],
      name: 'transferFrom',
      outputs: [{internalType: 'bool', name: '', type: 'bool'}],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
})

const fcAddress = 'cfxtest:achkx35n7vngfxgrm7akemk3ftzy47t61yk5nn270s'
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
  const sendNativeTokenButton = getElement('send_native_token')
  const approveButton = getElement('approve')
  const transferFromButton = getElement('transfer_from')
  const approveAccountInput = getElement('approve-account')
  const transferFromAccountInput = getElement('from-account')

  const personalSignButton = getElement('personal_sign')
  const typedSignButton = getElement('typed_sign')
  const addNetworkButton = getElement('add_network')
  const switchNetworkButton = getElement('switch_network')
  const addTokenButton = getElement('add_token')
  connectButton.disabled = false
  connectButton.onclick = () => {
    provider
      .request({
        method: 'cfx_requestAccounts',
      })
      .then(res => {
        if (res.error)
          return console.error('error', res.error.message || res.error)
        getElement('address').innerHTML = res.result
        console.log('result', res.result)
        sendNativeTokenButton.disabled = false
        approveButton.disabled = false
        transferFromButton.disabled = false
        personalSignButton.disabled = false
        typedSignButton.disabled = false
        addNetworkButton.disabled = false
        switchNetworkButton.disabled = false
        addTokenButton.disabled = false
      })
  }

  // send 1 native token to the connected address
  sendNativeTokenButton.onclick = async () => {
    const {
      result: [connectedAddress],
    } = await provider.request({method: 'cfx_accounts'})
    const tx = {
      from: connectedAddress,
      value: '0xde0b6b3a7640000',
      to: connectedAddress,
    }

    provider
      .request({method: 'cfx_sendTransaction', params: [tx]})
      .then(res => {
        if (res.error)
          return console.error('error', res.error.message || res.error)
        console.log('result', res.result)
        getElement(
          'send_native_token_result',
        ).innerHTML = `txhash: ${res.result}`
      })
  }
  // approve spender
  approveButton.onclick = async () => {
    try {
      const {
        result: [connectedAddress],
      } = await provider.request({method: 'cfx_accounts'})
      const tx = {
        from: connectedAddress,
        to: fcAddress,
        gas: '0x5a98',
        storageLimit: '0x80',
        data: exampleContract.approve(
          approveAccountInput.value,
          100000000000000000,
        ).data,
      }

      provider
        .request({method: 'cfx_sendTransaction', params: [tx]})
        .then(res => {
          if (res.error)
            return console.error('error', res.error.message || res.error)
          console.log('result', res.result)
        })
    } catch (err) {
      console.log('err', err)
    }
  }
  //transfer from
  transferFromButton.onclick = async () => {
    try {
      const {
        result: [connectedAddress],
      } = await provider.request({method: 'cfx_accounts'})
      const tx = {
        from: connectedAddress,
        to: fcAddress,
        data: exampleContract.transferFrom(
          transferFromAccountInput.value,
          'cfxtest:aak4wphw0a9pdcg704xj2ab17n6j9puwuj3d9yz0jx',
          10000000000000000,
        ).data,
      }
      provider
        .request({method: 'cfx_sendTransaction', params: [tx]})
        .then(res => {
          if (res.error)
            return console.error('error', res.error.message || res.error)
          console.log('result', res.result)
        })
    } catch (err) {
      console.log('err', err)
    }
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

  // request to add network
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

  // request to switch network
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

  // request to add token
  addTokenButton.onclick = () => {
    provider
      .request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: 'cfxtest:acepe88unk7fvs18436178up33hb4zkuf62a9dk1gv',
            symbol: 'cUSDT',
            decimals: 18,
            image:
              'https://scan-icons.oss-cn-hongkong.aliyuncs.com/testnet/cfxtest%3Aacepe88unk7fvs18436178up33hb4zkuf62a9dk1gv.png',
          },
        },
      })
      .then(res => {
        if (res.error) return console.error(res.error.message || res.error)
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
