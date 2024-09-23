import {expect, describe, it} from 'vitest'
import {getEthContractMethodSignature} from './eth-name'

describe('ETH Name', () => {
  it('should return token data', async () => {
    const tokenData = await getEthContractMethodSignature(
      '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
    )
    const {name, args} = tokenData
    expect(name).toStrictEqual('transfer')
    const to = args[0]
    const value = args[1]
    expect(to).toStrictEqual('0x2f318C334780961FB129D2a6c30D0763d9a5C970')
    expect(value._hex).toStrictEqual('0x3a98')
  })
})
