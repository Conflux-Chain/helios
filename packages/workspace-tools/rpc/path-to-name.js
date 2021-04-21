import {fileURLToPath} from 'url'

export default function getRpcNameFromPath(path) {
  if (path instanceof URL) path = fileURLToPath(path)
  const match = path.match(/packages\/rpcs\/\w+/)?.[0]
  if (!match) throw new Error('invalid rpc path')
  return match.slice(match.lastIndexOf('/') + 1)
}

// /helios/packages/rpcs/wallet_createAccount/index.js to wallet_createAccount
