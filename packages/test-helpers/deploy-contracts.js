const {sendTx: cfxSendTx} = require('./cfx.js')
const {sendTx: ethSendTx} = require('./eth.js')
const fs = require('fs')
const path = require('path')
const contractDir = path.resolve(__dirname, './contracts')
const {Interface} = require('@ethersproject/abi')
const {promisify} = require('util')
const readfile = promisify(fs.readFile)

// const CFX_CREATE2_ADDR = 'net2999:acfdzevjd15ew6jfme7vuzb94s5a276sjayhcynp0j'
// const ETH_CREATE2_ADDR = '0x86503ed2A81168640B76211e6F94ea74EcD2f614'
// const CFX_1820_ADDR = '0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820'
// const ETH_1820_ADDR = '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24'

const contractPath = path.resolve(__dirname, '../../contracts/compiled')
const contractsName = [
  // cfx net2999:acfdzevjd15ew6jfme7vuzb94s5a276sjayhcynp0j
  // cfx 0x8a3a92281df6497105513b18543fd3b60c778e40
  // eth 0xE5538A1FC85641053F5e4824846390c75B779A5F
  'Create2Factory',
  // cfx 0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820
  // eth 0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24
  'ERC1820Registry',
  // cfx net2999:ach8cpret14pg9huwjtpva62w2pa1z1d0ub91hshds
  // cfx 0x8fe131a47df4c37cf0921ec8839896180bd6e3b4
  // eth 0x33845d47195725a6b0a08eeda1e60ce9f2dcc80b
  'BalanceChecker',
  // 'TestToken1',
  // 'TestToken2',
]
let contractsBin = contractsName.map(c =>
  path.resolve(contractPath, `./${c}.bin`),
)
let contractsAbi = contractsName.map(c =>
  path.resolve(contractPath, `./${c}.abi`),
)

const getContracts = async () => {
  const contract = {
    bin: await Promise.all(
      contractsBin.map(c => readfile(c, {encoding: 'utf-8'})),
    ),
    abi: await Promise.all(
      contractsAbi.map(c =>
        readfile(c, {encoding: 'utf-8'}).then(abi => JSON.parse(abi)),
      ),
    ),
  }

  return contractsName.reduce(
    (acc, c, idx) => ({
      ...acc,
      [c]: {
        abi: contract.abi[idx],
        bin: contract.bin[idx],
        contract: new Interface(contract.abi[idx]),
      },
    }),
    {},
  )
}

export const deployETHBalanceChecker = async () => {
  const contracts = await getContracts()
  const balanceChecker = await ethSendTx({
    tx: {
      data: `0x${contracts.BalanceChecker.bin}`,
    },
  })
  return {
    contractAddress: balanceChecker.contractAddress.toLocaleLowerCase(),
  }
}
export const deployCFXBalanceChecker = async () => {
  const contracts = await getContracts()
  const balanceChecker = await cfxSendTx({
    tx: {
      data: `0x${contracts.BalanceChecker.bin}`,
    },
  })
  return {
    contractAddress: balanceChecker.contractCreated.toLocaleLowerCase(),
  }
}

const token1Bytecode = fs.readFileSync(
  path.resolve(contractDir, 'TestToken1.bin'),
  {
    encoding: 'utf-8',
  },
)
// const token1ABI = new Interface(
//   JSON.parse(
//     fs.readFileSync(path.resolve(contractDir, 'TestToken1.abi'), {
//       encoding: 'utf-8',
//     }),
//   ),
// )

const token2Bytecode = fs.readFileSync(
  path.resolve(contractDir, 'TestToken2.bin'),
  {
    encoding: 'utf-8',
  },
)

// const token2ABI = new Interface(
//   JSON.parse(
//     fs.readFileSync(path.resolve(contractDir, 'TestToken2.abi'), {
//       encoding: 'utf-8',
//     }),
//   ),
// )

export const deployCRC20 = async () => {
  const token1 = await cfxSendTx({
    tx: {
      data: `0x${token1Bytecode}`,
    },
  })

  const token2 = await cfxSendTx({
    tx: {
      data: `0x${token2Bytecode}`,
    },
  })
  return {
    token1: {
      contractAddress: token1.contractCreated.toLocaleLowerCase(),
    },
    token2: {
      contractAddress: token2.contractCreated.toLocaleLowerCase(),
    },
  }
}

export const deployERC20 = async () => {
  const token1 = await ethSendTx({
    tx: {
      data: `0x${token1Bytecode}`,
    },
  })

  const token2 = await ethSendTx({
    tx: {
      data: `0x${token2Bytecode}`,
    },
  })
  return {
    token1: {
      contractAddress: token1.contractAddress.toLocaleLowerCase(),
    },
    token2: {
      contractAddress: token2.contractAddress.toLocaleLowerCase(),
    },
  }
}
