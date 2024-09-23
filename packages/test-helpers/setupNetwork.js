import {beforeAll, afterAll} from 'vitest'

import hre from 'hardhat'
import {createServer} from '@xcfx/node'
import {CFX_LOCALNET_NETID} from '@fluent-wallet/consts'
import {
  deployCFXBalanceChecker,
  deployETHBalanceChecker,
} from './deploy-contracts'
import {GENESIS_PRI_KEY} from './cfx'
/**
 * @type {import('hardhat/types').JsonRpcServer}
 */
let hardhatJsonRpcServer

let confluxServer
beforeAll(async () => {
  // process.chdir(require.resolve('@fluent-wallet/test-helpers'))

  process.env.HARDHAT_NETWORK = 'hardhat'
  await new Promise(resolve => {
    hre.tasks['node:server-ready']?.setAction(async ({server}) => {
      hardhatJsonRpcServer = server
      resolve()
    })
    hre.run('node')
  })
  await deployETHBalanceChecker()
  confluxServer = await createServer({
    // silent: false,
    dev_block_interval_ms: 100,
    mode: 'dev',
    chain_id: CFX_LOCALNET_NETID,
    genesis_secrets: [GENESIS_PRI_KEY],
  })
  await confluxServer.start()
  await new Promise(resolve => setTimeout(resolve, 3000))
  await deployCFXBalanceChecker()
})

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 3000))
  await hardhatJsonRpcServer.close()
  await confluxServer.stop()
})
