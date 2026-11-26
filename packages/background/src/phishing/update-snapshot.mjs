// Maintainer tool, not part of the extension bundle. Pass a reviewed upstream commit.
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {compileFeed} from './domains.js'

const commit = process.argv[2]
if (!/^[0-9a-f]{40}$/.test(commit ?? ''))
  throw new Error('Expected the full MetaMask commit SHA')
const root = `https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/${commit}/`
function text(path) {
  return execFileSync(
    'curl',
    ['--fail', '--silent', '--show-error', '--max-time', '30', root + path],
    {encoding: 'utf8', maxBuffer: 12 * 1024 * 1024},
  )
}
const source = text('src/config.json')
const license = text('LICENSE')
const rules = compileFeed(JSON.parse(source))
if (rules.block.size < 50000 || rules.allow.size < 20)
  throw new Error('Incomplete snapshot')
const dir = new URL('./snapshot/', import.meta.url)
await mkdir(dir, {recursive: true})
await writeFile(
  new URL('metamask-domains.json', dir),
  JSON.stringify(
    {
      source: `https://github.com/MetaMask/eth-phishing-detect/tree/${commit}`,
      sourceSha256: createHash('sha256').update(source).digest('hex'),
      version: 2,
      whitelist: [...rules.allow].sort(),
      blacklist: [...rules.block].sort(),
    },
    null,
    2,
  ) + '\n',
)
await writeFile(new URL('LICENSE-MetaMask.txt', dir), license)
console.log(
  `Packaged ${rules.allow.size} allowlist and ${rules.block.size} blocklist hosts`,
)
