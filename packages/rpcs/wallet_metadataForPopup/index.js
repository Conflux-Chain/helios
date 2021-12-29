import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_metadataForPopup'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup'],
  locked: true,
  methods: [
    'wallet_zeroAccountGroup',
    'wallet_isLocked',
    'wallet_getPendingAuthRequest',
  ],
  db: [],
}

export const main = async ({
  rpcs: {
    wallet_zeroAccountGroup,
    wallet_isLocked,
    wallet_getPendingAuthRequest,
  },
}) => {
  const [locked, zeroGroup] = await Promise.all([
    wallet_isLocked(),
    wallet_zeroAccountGroup(),
  ])

  if (locked) return {locked, zeroGroup}
  return {
    locked,
    zeroGroup,
    pendingAuthReq: await wallet_getPendingAuthRequest(),
  }
}
