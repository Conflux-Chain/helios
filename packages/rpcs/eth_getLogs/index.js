import {
  or,
  zeroOrOne,
  zeroOrMore,
  map,
  blockRef,
  Hash32,
  ethHexAddress,
  nul,
  Bytes32,
} from '@fluent-wallet/spec'

export const NAME = 'eth_getLogs'

const singleTopic = [or, nul, Bytes32]
const topicSchema = [zeroOrMore, singleTopic]

export const schemas = {
  input: [
    zeroOrOne,
    [
      map,
      {closed: true},
      ['fromBlock', {optional: true}, blockRef],
      ['toBlock', {optional: true}, blockRef],
      [
        'address',
        {optional: true},
        [or, ethHexAddress, [zeroOrMore, ethHexAddress]],
      ],
      ['blockHash', {optional: true}, Hash32],
      ['topics', [zeroOrMore, [or, singleTopic, topicSchema]]],
    ],
  ],
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [],
  db: [],
}

export const main = ({f, params}) => {
  return f(params)
}
