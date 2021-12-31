const {
  cfx, // , eth
} = require('@fluent-wallet/test-helpers')
const {
  sendTx, // , cfxCall
} = require('@fluent-wallet/test-helpers/cfx.js')
const path = require('path')
const {spawn} = require('child_process')
const {getContracts} = require('./integration-test-contracts.js')

let eth

async function cleanup(code) {
  console.log('exit code = ', code)
  eth.kill(9)
  return await Promise.all([
    cfx.quit(), // , eth.quit()
  ]).catch(() => {})
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGUSR1', cleanup)
process.on('SIGUSR2', cleanup)

process.argv.push('--forceExit')
;(async () => {
  const contracts = await getContracts()
  eth = spawn('node', [path.resolve(__dirname, './start-ganache.js')])
  eth.stderr.on('data', d => console.error('[ganache]', d.toString()))
  eth.stdout.on('data', d => console.log('[ganache]', d.toString()))
  await new Promise(resolve => {
    eth.stdout.on(
      'data',
      d => d.toString().includes('ganache is ready') && resolve(),
    )
  })
  await cfx.start()
  // 1820 address 0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820
  await sendTx({
    tx: {
      to: '0x8a3a92281df6497105513b18543fd3b60c778e40',
      data: contracts.Create2Factory.contract.encodeFunctionData('deploy', [
        '0x' + contracts.ERC1820Registry.bin,
        '0x45db18e7fb',
      ]),
    },
  })

  // console.log(
  //   await cfxCall({
  //     tx: {
  //       to: '0x8a3a92281df6497105513b18543fd3b60c778e40',
  //       data: contracts.Create2Factory.contract.encodeFunctionData('deploy', [
  //         '0x' + contracts.BalanceChecker.bin,
  //         '0x1',
  //       ]),
  //     },
  //   }),
  // )

  await sendTx({
    tx: {
      to: '0x8a3a92281df6497105513b18543fd3b60c778e40',
      data: contracts.Create2Factory.contract.encodeFunctionData('deploy', [
        '0x' + contracts.BalanceChecker.bin,
        '0x1',
      ]),
    },
  })

  require('jest-cli/bin/jest')
})()
