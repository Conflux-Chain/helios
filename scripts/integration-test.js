// Preserve the old CLI entry point without starting a second set of test nodes.
// The Vitest integration suite owns the @xcfx/node and Hardhat lifecycles.
const {spawnSync} = require('node:child_process')
const {dirname, resolve} = require('node:path')
const manifest = require.resolve('vitest/package.json')
const cli = resolve(dirname(manifest), require(manifest).bin.vitest)
const result = spawnSync(
  process.execPath,
  [
    cli,
    'run',
    'packages/background/src/index.integration.test.js',
    ...process.argv.slice(2),
  ],
  {cwd: resolve(__dirname, '..'), stdio: 'inherit'},
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
