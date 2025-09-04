import {expect, describe, it} from 'vitest'
import {getEthContractMethodSignature} from './eth-name'
import {
  CFX_ESPACE_MAINNET_NETID,
  CFX_ESPACE_TESTNET_NETID,
} from '@fluent-wallet/consts'

describe('ETH Name', () => {
  it('should return token data', async () => {
    const tokenData = await getEthContractMethodSignature(
      '0x6963efed0ab40f6c3d7bda44a05dcf1437c44372',
      '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
      CFX_ESPACE_MAINNET_NETID,
    )
    const {name, args} = tokenData
    expect(name).toStrictEqual('transfer')
    const to = args[0]
    const value = args[1]
    expect(to).toStrictEqual('0x2f318C334780961FB129D2a6c30D0763d9a5C970')
    expect(value._hex).toStrictEqual('0x3a98')
  })

  it('should return token data testnet', async () => {
    const tokenData = await getEthContractMethodSignature(
      '0x7d682e65efc5c13bf4e394b8f376c48e6bae0355',
      '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
      CFX_ESPACE_TESTNET_NETID,
    )
    const {name, args} = tokenData
    expect(name).toStrictEqual('transfer')
    const to = args[0]
    const value = args[1]
    expect(to).toStrictEqual('0x2f318C334780961FB129D2a6c30D0763d9a5C970')
    expect(value._hex).toStrictEqual('0x3a98')
  })
  it('should fallback to iface', async () => {
    const tokenData = await getEthContractMethodSignature(
      '0x7d682e65efc5c13bf4e394b8f376c48e6bae0000', // fake address
      '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
      CFX_ESPACE_TESTNET_NETID,
    )
    const {name, args} = tokenData
    expect(name).toStrictEqual('transfer')
    const to = args[0]
    const value = args[1]
    expect(to).toStrictEqual('0x2f318C334780961FB129D2a6c30D0763d9a5C970')
    expect(value._hex).toStrictEqual('0x3a98')
  })

  it('should throw error not match', async () => {
    await expect(async () =>
      getEthContractMethodSignature(
        '0x06ffec863331bccdf4d2f8bf393b18ee37387000', // fake address
        '0x0e89341c0000000000000000000000000000000000000000000000000000000000000001',
        CFX_ESPACE_TESTNET_NETID,
      ),
    ).rejects.toThrowError()
  })

  it('should return functionName uri', async () => {
    const data = await getEthContractMethodSignature(
      '0x06ffec863331bccdf4d2f8bf393b18ee3738711e',
      '0x0e89341c0000000000000000000000000000000000000000000000000000000000000001',
      CFX_ESPACE_TESTNET_NETID,
    )

    const {name} = data
    expect(name).toStrictEqual('uri')
  })
})
