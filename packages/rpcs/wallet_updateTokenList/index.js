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
  db: ['getNetworkById', 'upsertTokenList', 't'],
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
  db: {getNetworkById, upsertTokenList, t},
  params: {
    tokenList: {url, name},
    networkId,
  },
}) => {
  let network = getNetworkById(networkId)
  if (!network) throw InvalidParams(`Invalid network id ${networkId}`)

  let tokenList
  try {
    tokenList = await fetch(url, {cache: 'no-cache'}).then(r => r.json())
  } catch (err) {
    throw InvalidParams(`Invalid token list ${url}`)
  }

  validateAndFormatTokenList({tokenList, InvalidParams})
  name = name || tokenList.name

  const oldTokenListVersion = network.tokenList?.value?.version

  // if there's no old version or new version exist
  const isNewVersion =
    !oldTokenListVersion ||
    isNewVersionTokenList(oldTokenListVersion, tokenList.version)
  if (!isNewVersion) return

  upsertTokenList({newList: tokenList.tokens, networkId})
  t([
    // create tokenList
    {eid: -1, tokenList: {url, name, value: tokenList}},
    // add tokenList to network
    {eid: networkId, network: {tokenList: -1}},
  ])
}
