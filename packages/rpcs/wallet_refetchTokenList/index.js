import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_refetchTokenList'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_updateTokenList'],
  db: ['getNetwork'],
}

export const main = async ({
  db: {getNetwork},
  rpcs: {wallet_updateTokenList},
}) => {
  const promises = getNetwork().reduce(
    (acc, n) =>
      n.tokenList
        ? acc.concat([
            wallet_updateTokenList({
              networkId: n.eid,
              tokenList: {url: n.tokenList.url, name: n.tokenList.name},
            }),
          ])
        : acc,
    [],
  )

  return await Promise.all(promises)
}
