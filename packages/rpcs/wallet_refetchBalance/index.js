import {or, optParam, enums, map, truep} from '@fluent-wallet/spec'

export const NAME = 'wallet_refetchBalance'

export const schemas = {
  input: [
    or,
    optParam,
    [
      map,
      {closed: true},
      [
        'type',
        {
          optional: true,
          doc: 'all for fetch balance all accounts rather than selected account',
        },
        [enums, 'all'],
      ],
      [
        'allNetwork',
        {optional: true, doc: 'true to refetch balance of all network'},
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
  network,
}) => {
  const refetchBalanceParams = getSingleCallBalanceParams({
    type: params?.type,
    allNetwork: Boolean(params?.allNetwork),
    networkId: network.eid,
  })

  // eslint-disable-next-line no-unused-vars
  const promises = refetchBalanceParams.map(([_, [users, tokens, network]]) =>
    wallet_getBalance(
      {network, networkName: network.name, errorFallThrough: true},
      {users, tokens},
    )
      .then(rst => {
        return rst && upsertBalances({data: rst, networkId: network.id})
      })
      .catch(err => console.warn('refetchBalance error', err)),
  )

  await Promise.all(promises)
  return true
}
