import * as spec from '@fluent-wallet/spec'
import GenTokenListSchema from '@fluent-wallet/token-list-schema'

const {map, url, dbid, nickname, validate, explain} = spec
export const NAME = 'wallet_updateTokenList'
export const TokenListSchema = GenTokenListSchema(spec)

export const InnerTokenListSchema = [
  map,
  {closed: true},
  ['url', url],
  ['name', {optional: true}, nickname],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['tokenList', InnerTokenListSchema],
    ['networkId', dbid],
  ],
}

export const permissions = {
  external: ['popup'],
  methods: [],
  db: ['t', 'getNetworkById', 'retract'],
}

export const validateAndFormatTokenList = ({tokenList, InvalidParams}) => {
  if (!validate(TokenListSchema, tokenList)) {
    throw InvalidParams(
      `Invalid token list format.\n${JSON.stringify(
        explain(TokenListSchema, tokenList),
        null,
        4,
      )}`,
    )
  }

  const {logoURI, tokens} = tokenList

  const protocolRegex = new RegExp(/^https?:/, 'i')

  const allUrlHasValidProtocol = tokens.reduce((acc, {logoURI}) => {
    if (!acc) return false
    if (!logoURI) return acc
    return protocolRegex.test(logoURI)
  }, protocolRegex.test(logoURI))

  if (!allUrlHasValidProtocol)
    throw InvalidParams(
      'Unsupported logoURI protocol found in token list, only support http/https for now.',
    )
}

const isNewVersionTokenList = (
  {major: omajor, minor: ominor, patch: opatch},
  {major, minor, patch},
) => {
  if (major > omajor) return true
  if (major === omajor && minor > ominor) return true
  if (major === omajor && minor === ominor && patch > opatch) return true

  return false
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById, t, retract},
  params: {
    tokenList: {url, name},
    networkId,
  },
}) => {
  let network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)

  let tokenList
  try {
    tokenList = await fetch(url).then(r => r.json())
  } catch (err) {
    throw InvalidParams(`Invalid token list ${url}`)
  }

  validateAndFormatTokenList({tokenList, InvalidParams})
  name = name || tokenList.name

  const oldTokenList = network.tokenList
  const oldTokenListVersion = network.tokenList?.value?.version
  const isNewVersion =
    !oldTokenListVersion ||
    isNewVersionTokenList(oldTokenListVersion, tokenList.version)
  if (!isNewVersion) return

  const oldTokens =
    oldTokenList?.token?.reduce(
      (acc, {eid, fromApp, fromUser}) =>
        !fromApp && !fromUser ? acc.concat([eid]) : acc,
      [],
    ) || []

  if (oldTokenList) retract(oldTokenList.eid)
  oldTokens.forEach(retract)

  network = getNetworkById(networkId)
  const [existTokensIdx, existTokensAddr] = (network.token || []).reduce(
    (acc, {address}, idx) => [acc[0].concat([idx]), acc[1].concat([address])],
    [[], []],
  )

  const addTokenTxs = tokenList.tokens.reduce(
    (acc, t, idx) => {
      let eid = -idx - 10000
      const dupIdx = existTokensAddr.indexOf(t.address)
      if (dupIdx !== -1) {
        eid = network.token[existTokensIdx[dupIdx]].eid
      }

      t.fromList = true

      // create token
      const addTokenTx = {eid, token: t}
      // add token to network
      const tokenIntoNetworkTx = {eid: networkId, network: {token: eid}}
      // add token to tokenList
      const tokenIntoTokenListTx = {eid: -1, tokenList: {token: eid}}

      return [...acc, addTokenTx, tokenIntoNetworkTx, tokenIntoTokenListTx]
    },
    [
      // create tokenList
      {eid: -1, tokenList: {url, name, value: tokenList}},
      // add tokenList to network
      {eid: networkId, network: {tokenList: -1}},
    ],
  )

  t(addTokenTxs)
}
