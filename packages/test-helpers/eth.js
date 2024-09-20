const ganache = require('ganache-core') // ganache-core is removed
const {promisify} = require('util')
const ethers = require('ethers')
const {sendETH, sendTx, sendRawTx, ethCall} = require('./sendETH')

const GENESIS_PRI_KEY =
  '0x46b9e861b63d3509c88b7817275a30d22d62c8cd8fa6486ddee35ef0d8e0495f'
// const GENESIS_ADDRESS = '0xfbe45681Ac6C53D5a40475F7526baC1FE7590fb8'
const DEFAULT_ACCOUNTS = [
  {
    secretKey: GENESIS_PRI_KEY,
    balance: '18446744073709551615',
  },
]
const defaultOptions = {
  default_balance_ether: '18446744073709551615',
  blockTime: 0.2,
  network_id: 1337,
  mnemonic:
    'phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent',
  port: 8545,
  vmErrorsOnRPCResponse: false,
}

class Ganache {
  async start(opts = {}) {
    const options = {
      ...defaultOptions,
      ...opts,
      accounts: [...DEFAULT_ACCOUNTS, opts.accounts || []],
    }
    const {port} = options
    this._server = ganache.server(options)

    this._provider = new ethers.providers.Web3Provider(this._server.provider)
    this._wallet = new ethers.Wallet(
      '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553',
      this._provider,
    )

    const listen = promisify(this._server.listen).bind(this._server)
    // const blockchain =
    await listen(port)

    this
  }

  async sendETH({balance, address}) {
    if (!this._wallet) {
      throw new Error('server not started')
    }
    await this._wallet
      .sendTransaction({
        to: address,
        value: balance,
      })
      .then(r => r.wait())
  }

  async restart(opts) {
    await this.quit()
    return await this.start(opts)
  }

  async quit() {
    if (!this._server) {
      return
    }
    const close = promisify(this._server.close).bind(this._server)
    await close()
  }
}

module.exports = {
  ethCall,
  sendETH,
  sendTx,
  sendRawTx,
  Ganache,
  GENESIS_PRI_KEY,
}
