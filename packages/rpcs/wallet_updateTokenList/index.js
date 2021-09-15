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
  db: ['t', 'getNetworkById'],
}

export const validateAndFormatTokenList = ({tokenList, InvalidParams}) => {
  if (!validate(TokenListSchema, tokenList)) {
    throw InvalidParams(
      `Invalid token list format.\n${explain(TokenListSchema, tokenList)}`,
    )
  }

  const {logoURI, tokens} = tokenList

  const protocolTest = /^https?:/i.test

  const anyUnsupportedProtocol = tokens.reduce((acc, {logoURI}) => {
    if (!acc) return
    if (!logoURI) return acc
    return protocolTest(logoURI)
  }, protocolTest(logoURI))

  if (anyUnsupportedProtocol)
    throw InvalidParams(
      'Unsupported logoURI protocol found in token list, only support http/https for now.',
    )
}

export const main = async ({
  Err: {InvalidParams},
  db: {getNetworkById, t},
  // rpcs: {},
  params: {url, name, networkId},
}) => {
  const network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)

  let tokenList
  try {
    tokenList = await fetch(url).then(r => r.json())
  } catch (err) {
    throw InvalidParams(`Invalid token list ${url}`)
  }

  validateAndFormatTokenList(tokenList)
  name = name || tokenList.name

  const [existTokensIdx, existTokensAddr] = network.token.reduce(
    (acc, {address}, idx) => [
      [...acc[0], idx],
      [...acc[1], address],
    ],
    [[], []],
  )

  const addTokenTxs = tokenList.tokens.reduce(
    (acc, t, idx) => {
      let eid = -idx - 10000
      const dupIdx = existTokensAddr.indexOf(t.address)
      if (dupIdx !== -1) {
        eid = network.token[existTokensIdx[dupIdx]]
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
