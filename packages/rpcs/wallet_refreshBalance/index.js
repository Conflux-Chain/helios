import {or, optParam, truep, map} from '@fluent-wallet/spec'

export const NAME = 'wallet_refreshBalance'

export const schemas = {
  input: [
    or,
    optParam,
    [
      map,
      {closed: true},
      [
        'allToken',
        {doc: 'check balance of all tokens (in wallet) of all account'},
        truep,
      ],
    ],
  ],
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: ['wallet_getBalance'],
  db: ['getSingleCallBalanceParams', 'upsertBalances'],
}

export const main = async ({
  db: {getSingleCallBalanceParams, upsertBalances},
  params,
  rpcs: {wallet_getBalance},
}) => {
  const refreshBalanceParams = getSingleCallBalanceParams({
    type: params?.allToken ? 'all' : 'refresh',
  })

  // eslint-disable-next-line no-unused-vars
  const promises = refreshBalanceParams.map(([_, [users, tokens, network]]) =>
    wallet_getBalance(
      {network, networkName: network.name},
      {users, tokens},
    ).then(rst => {
      return rst && upsertBalances({data: rst, networkId: network.eid})
    }),
  )

  await Promise.all(promises)
  return true
}
