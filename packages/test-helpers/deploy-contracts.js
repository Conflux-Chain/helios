const {sendTx: cfxSendTx, cfxCall} = require('./cfx.js')
const {sendTx: ethSendTx, ethCall} = require('./eth.js')
const fs = require('fs')
const path = require('path')
const contractDir = path.resolve(__dirname, './contracts')
const {Interface} = require('@ethersproject/abi')

const CFX_CREATE2_ADDR = 'net2999:acfdzevjd15ew6jfme7vuzb94s5a276sjayhcynp0j'
const ETH_CREATE2_ADDR = '0xE5538A1FC85641053F5e4824846390c75B779A5F'
// const CFX_1820_ADDR = '0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820'
// const ETH_1820_ADDR = '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24'

const contracts = [
  fs.readFileSync(path.resolve(contractDir, 'TestToken1.bin'), {
    encoding: 'utf-8',
  }),
  new Interface(
    JSON.parse(
      fs.readFileSync(path.resolve(contractDir, 'TestToken1.abi'), {
        encoding: 'utf-8',
      }),
    ),
  ),
  // 0x8af438d1de8f5cb58353f418abcad1062eb9dbce
  [
    'net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w',
    '0x8af438d1de8f5cb58353f418abcad1062eb9dbce',
    '0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341',
  ],
  fs.readFileSync(path.resolve(contractDir, 'TestToken2.bin'), {
    encoding: 'utf-8',
  }),
  new Interface(
    JSON.parse(
      fs.readFileSync(path.resolve(contractDir, 'TestToken2.abi'), {
        encoding: 'utf-8',
      }),
    ),
  ),
  [
    'net2999:acgjx5c8072590gk3namj5mwsernrs8syjgw92xcyt',
    '0x8c89ec5eb771bfd8c9cac0a46d52711ab6bbcea2',
    '0x2f154def814f04aa5ae2446681264bf3428956b4',
  ],
]

const create2 = new Interface(
  JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './contracts/Create2Factory.abi'), {
      encoding: 'utf-8',
    }),
  ),
)

const deployCRC20 = async () => {
  try {
    // 0x8307b5ef8cc74e63603261b6e2cf75028334907f
    // net2999:acftjsgv54hz3rpdmt4bvm8m4edc7ss532kxzzjt3w
    // 0x8c89ec5eb771bfd8c9cac0a46d52711ab6bbcea2
    // cfxtest:acgjx5c8072590gk3namj5mwsernrs8syjn3pvb2uz
    for (let i = 0; i < contracts.length; i += 3) {
      const c = contracts[i]
      // const iface = contracts[i + 1]
      const addr = contracts[i + 2]
      const deployed =
        (await cfxCall({
          tx: {
            to: CFX_CREATE2_ADDR,
            data: create2.encodeFunctionData('isDeployed', [addr[1]]),
          },
        })) ===
        '0x0000000000000000000000000000000000000000000000000000000000000001'

      if (!deployed) {
        // await cfxCall({
        //   tx: {
        //     to: CFX_CREATE2_ADDR,
        //     data: create2.encodeFunctionData('deploy', ['0x' + c, '0x1']),
        //   },
        // }).then(console.log)
        await cfxSendTx({
          tx: {
            to: CFX_CREATE2_ADDR,
            data: create2.encodeFunctionData('deploy', ['0x' + c, '0x1']),
          },
        })
      }
    }
  } catch (err) {
    console.log('deploy contract error', err)
    if (/create2\sfailed/.test(err.message)) return
    throw err
  }
}

const deployERC20 = async () => {
  try {
    // 0x4d59d6d6a52014dd71e8929bd5d3e6d0e7a9f341
    // 0x2f154def814f04aa5ae2446681264bf3428956b4
    for (let i = 0; i < contracts.length; i += 3) {
      const c = contracts[i]
      // const iface = contracts[i + 1]
      const addr = contracts[i + 2]
      const deployed =
        (await ethCall({
          tx: {
            to: ETH_CREATE2_ADDR,
            data: create2.encodeFunctionData('isDeployed', [addr[2]]),
          },
        })) ===
        '0x0000000000000000000000000000000000000000000000000000000000000001'

      if (!deployed) {
        // await ethCall({
        //   tx: {
        //     to: ETH_CREATE2_ADDR,
        //     data: create2.encodeFunctionData('deploy', ['0x' + c, '0x1']),
        //   },
        // }).then(console.log)
        await ethSendTx({
          tx: {
            to: ETH_CREATE2_ADDR,
            data: create2.encodeFunctionData('deploy', ['0x' + c, '0x1']),
          },
        })
      }
    }
  } catch (err) {
    console.log('deploy contract error', err)
    if (/create2\sfailed/.test(err.message)) return
    throw err
  }
}

module.exports = {deployCRC20, deployERC20}
