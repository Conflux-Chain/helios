import {url, map} from '@cfxjs/spec'

export const NAME = 'wallet_detectNetworkType'

export const schemas = {
  input: [map, {closed: true}, ['url', url]],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
}

export const main = async ({f, Err: {InvalidParams}, params: {url}}) => {
  let rst

  try {
    rst = await f(
      {
        networkName: url,
        network: {endpoint: url, name: url},
        method: 'cfx_getStatus',
      },
      [],
    )
  } catch (err) {
    throw InvalidParams(`Invalid rpc endpoint ${url}`)
  }

  if (rst?.result) {
    return {
      chainId: rst.result.chainId,
      netId: parseInt(rst.result.networkId, 16).toString(),
      type: 'cfx',
    }
  }

  try {
    rst = await f(
      {
        networkName: url,
        network: {endpoint: url, name: url},
        method: 'eth_chainId',
      },
      [],
    )
  } catch (err) {
    throw InvalidParams(`Invalid rpc endpoint ${url}`)
  }

  if (rst?.result) {
    const netId = (
      await f(
        {
          networkName: url,
          network: {endpoint: url, name: url},
          method: 'net_version',
        },
        [],
      )
    ).result

    return {
      netId: parseInt(netId, 10).toString(),
      chainId: rst.result,
      type: 'eth',
    }
  }

  throw InvalidParams(`Unsupported network type`)
}
