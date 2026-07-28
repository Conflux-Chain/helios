import {expect, describe, test} from 'vitest'
// eslint-disable-next-line no-unused-vars
import waitForExpect from 'wait-for-expect'
import {Mainnet, Hardfork, createCustomCommon} from '@ethereumjs/common'
import {createTxFromRLP} from '@ethereumjs/tx'
import {hexToBytes} from '@ethereumjs/util'
import {fromPrivate} from '@fluent-wallet/account'
import {
  ethEncodeEip7702Transaction,
  ethSignEip7702Transaction,
  personalSign,
  hashEip7702Authorization,
  signEip7702AuthorizationList,
  signTypedData_v4,
  signEip7702Authorization,
  recoverTypedSignature_v4,
  recoverPersonalSignature,
  getTxHashFromRawTx,
  decodeEthRawTransaction,
} from './'
import txhash1820 from './1820-txhash'

const testSigner = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey:
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
}

describe('cfx', () => {
  describe('personal sign', () => {
    test('personal sign and recover', async () => {
      const pk =
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const address = 'cfxtest:aasm4c231py7j34fghntcfkdt2nm9xv1tu6jd3r1s7'
      const netid = 1
      const message = 'Hello, world!'
      const signature = await personalSign('cfx', pk, message)
      const recovered = recoverPersonalSignature(
        'cfx',
        signature,
        message,
        netid,
      )
      expect(recovered).toEqual(address)
    })
  })

  describe('v4', () => {
    test('signTypedData_v4', async () => {
      const typedData = {
        types: {
          CIP23Domain: [
            {name: 'name', type: 'string'},
            {name: 'version', type: 'string'},
            {name: 'chainId', type: 'uint256'},
            {name: 'verifyingContract', type: 'address'},
          ],
          Person: [
            {name: 'name', type: 'string'},
            {name: 'wallets', type: 'address[]'},
          ],
          Mail: [
            {name: 'from', type: 'Person'},
            {name: 'to', type: 'Person[]'},
            {name: 'contents', type: 'string'},
          ],
          Group: [
            {name: 'name', type: 'string'},
            {name: 'members', type: 'Person[]'},
          ],
        },
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            wallets: [
              '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
              '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
            ],
          },
          to: [
            {
              name: 'Bob',
              wallets: [
                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                '0xB0B0b0b0b0b0B000000000000000000000000000',
              ],
            },
          ],
          contents: 'Hello, Bob!',
        },
      }

      const pk =
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const address = 'cfxtest:aasm4c231py7j34fghntcfkdt2nm9xv1tu6jd3r1s7'
      const netid = 1

      const sig = await signTypedData_v4('cfx', pk, typedData)
      expect(sig).toEqual(
        '0x3404e089c443cbe853e35d53670ae074860731930fa4ac87f2f6e10d7f2337270ac970680c7d609b5bb2f05b50398aee323ddac925e9e9ead5accc3fd2fb849001',
      )

      expect(
        await recoverTypedSignature_v4(
          'cfx',
          '0x3404e089c443cbe853e35d53670ae074860731930fa4ac87f2f6e10d7f2337270ac970680c7d609b5bb2f05b50398aee323ddac925e9e9ead5accc3fd2fb849001',
          typedData,
          netid,
        ),
      ).toBe(address)
    })

    test('signTypedData_v4 with recursive types', async () => {
      const typedData = {
        types: {
          CIP23Domain: [
            {name: 'name', type: 'string'},
            {name: 'version', type: 'string'},
            {name: 'chainId', type: 'uint256'},
            {name: 'verifyingContract', type: 'address'},
          ],
          Person: [
            {name: 'name', type: 'string'},
            {name: 'mother', type: 'Person'},
            {name: 'father', type: 'Person'},
          ],
        },
        domain: {
          name: 'Family Tree',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Person',
        message: {
          name: 'Jon',
          mother: {name: 'Lyanna', father: {name: 'Rickard'}},
          father: {name: 'Rhaegar', father: {name: 'Aeris II'}},
        },
      }

      const pk =
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const address = 'cfxtest:aasm4c231py7j34fghntcfkdt2nm9xv1tu6jd3r1s7'
      const netid = 1

      const sig = await signTypedData_v4('cfx', pk, typedData)
      expect(sig).toEqual(
        '0xa5d4de96227cb8d7b6e3d44c8ca3f66f6361d81530e7c386c4fbaa55a8fa3df0229807250407e0c500803f1efd095d2a24554b520be9e88ee1e79a13efc4379101',
      )

      expect(
        await recoverTypedSignature_v4(
          'cfx',
          '0xa5d4de96227cb8d7b6e3d44c8ca3f66f6361d81530e7c386c4fbaa55a8fa3df0229807250407e0c500803f1efd095d2a24554b520be9e88ee1e79a13efc4379101',
          typedData,
          netid,
        ),
      ).toBe(address)
    })
  })
})

describe('eth', () => {
  describe('personal sign', () => {
    test('personalSign and recover', async () => {
      const address = '0x29C76e6aD8f28BB1004902578Fb108c507Be341b'
      const privKeyHex =
        '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0'
      const privKey = Buffer.from(privKeyHex, 'hex')
      const message = 'Hello, world!'
      const signature = await personalSign('eth', privKey, message)
      const recovered = recoverPersonalSignature('eth', signature, message)

      expect(recovered).toEqual(address)
    })
  })

  describe('v4', () => {
    test('signTypedData_v4', async () => {
      const typedData = {
        types: {
          EIP712Domain: [
            {name: 'name', type: 'string'},
            {name: 'version', type: 'string'},
            {name: 'chainId', type: 'uint256'},
            {name: 'verifyingContract', type: 'address'},
          ],
          Person: [
            {name: 'name', type: 'string'},
            {name: 'wallets', type: 'address[]'},
          ],
          Mail: [
            {name: 'from', type: 'Person'},
            {name: 'to', type: 'Person[]'},
            {name: 'contents', type: 'string'},
          ],
          Group: [
            {name: 'name', type: 'string'},
            {name: 'members', type: 'Person[]'},
          ],
        },
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            wallets: [
              '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
              '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
            ],
          },
          to: [
            {
              name: 'Bob',
              wallets: [
                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                '0xB0B0b0b0b0b0B000000000000000000000000000',
              ],
            },
          ],
          contents: 'Hello, Bob!',
        },
      }

      const {privateKey, address} = fromPrivate(
        '0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4',
      )
      expect(address.toLowerCase()).toEqual(
        '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826',
      )

      const sig = await signTypedData_v4('eth', privateKey, typedData)
      expect(sig).toEqual(
        '0x65cbd956f2fae28a601bebc9b906cea0191744bd4c4247bcd27cd08f8eb6b71c78efdf7a31dc9abee78f492292721f362d296cf86b4538e07b51303b67f749061b',
      )
    })
    test('signTypedData_v4 with recursive types', async () => {
      const typedData = {
        types: {
          EIP712Domain: [
            {name: 'name', type: 'string'},
            {name: 'version', type: 'string'},
            {name: 'chainId', type: 'uint256'},
            {name: 'verifyingContract', type: 'address'},
          ],
          Person: [
            {name: 'name', type: 'string'},
            {name: 'mother', type: 'Person'},
            {name: 'father', type: 'Person'},
          ],
        },
        domain: {
          name: 'Family Tree',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Person',
        message: {
          name: 'Jon',
          mother: {
            name: 'Lyanna',
            father: {
              name: 'Rickard',
            },
          },
          father: {
            name: 'Rhaegar',
            father: {
              name: 'Aeris II',
            },
          },
        },
      }

      const {privateKey, address} = fromPrivate(
        '0xd11570f3bf2c8bc97826cfcdf149860362b355201eae78794a34eb06351e601f',
      )
      expect(address.toLowerCase()).toEqual(
        '0x065a687103c9f6467380bee800ecd70b17f6b72f',
      )

      const sig = await signTypedData_v4('eth', privateKey, typedData)

      expect(sig).toEqual(
        '0xf2ec61e636ff7bb3ac8bc2a4cc2c8b8f635dd1b2ec8094c963128b358e79c85c5ca6dd637ed7e80f0436fe8fce39c0e5f2082c9517fe677cc2917dcd6c84ba881c',
      )

      expect(
        await recoverTypedSignature_v4(
          'eth',
          '0xf2ec61e636ff7bb3ac8bc2a4cc2c8b8f635dd1b2ec8094c963128b358e79c85c5ca6dd637ed7e80f0436fe8fce39c0e5f2082c9517fe677cc2917dcd6c84ba881c',
          typedData,
        ),
      ).toBe('0x065a687103C9F6467380beE800ecD70B17f6b72F')
    })
  })
})

describe('getTxHashFromRawTx', () => {
  test('getTxHashFromRawTx', async () => {
    expect(getTxHashFromRawTx(txhash1820)).toBe(
      '0xfefb2da535e927b85fe68eb81cb2e4a5827c905f78381a01ef2322aa9b0aee8e',
    )
  })
})
describe('raw Ethereum transaction decoding', () => {
  test('decodes an Ethereum transaction', () => {
    const transaction = decodeEthRawTransaction(txhash1820, '0x1')

    expect(transaction).toMatchObject({
      type: '0x0',
      chainId: '0x1',
      nonce: '0x0',
      from: '0xa990077c3205cbdf861e17fa532eeb069ce9ff96',
    })
  })
})

describe('eth eip-7702 authorization', () => {
  const authorization = {
    chainId: 1,
    contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    nonce: 0,
  }
  const signedAuthorization = {
    r: '0xff5d79daa56d5aae2657e8950af71377f8c2860255a9c915948c071ef9286def',
    s: '0x17318a10ff56f0000a350a210fdb312ba22260a64f38dddc135912a6c4795c1d',
    yParity: '0x0',
  }

  test('hashEip7702Authorization', () => {
    expect(hashEip7702Authorization(authorization)).toBe(
      '0xa357bcb1f69e88d2c170904a18bc5bb8fe25872923a8d0a92f3e57c2d6df35cb',
    )
  })

  test('hashEip7702Authorization encodes zero values canonically', () => {
    expect(
      hashEip7702Authorization({
        chainId: 0,
        contractAddress: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
        nonce: 0,
      }),
    ).toBe('0x70f22b957bc18cbaa757a12cc3e5fa5268b98b24afe15a35a76e6874748a8bfa')
  })

  test('signEip7702Authorization', () => {
    expect(
      signEip7702Authorization(authorization, testSigner.privateKey),
    ).toEqual(signedAuthorization)
  })

  test('signEip7702AuthorizationList', () => {
    expect(
      signEip7702AuthorizationList(
        [
          {
            address: authorization.contractAddress.toLowerCase(),
            chainId: '0x1',
            nonce: '0x0',
          },
        ],
        testSigner.privateKey,
      ),
    ).toEqual([
      {
        address: authorization.contractAddress.toLowerCase(),
        chainId: '0x1',
        nonce: '0x0',
        ...signedAuthorization,
      },
    ])
  })
})

describe('eth eip-7702 transaction', () => {
  const createSignedAuthorizationEntry = ({
    chainId,
    contractAddress,
    nonce,
  }) => ({
    chainId: `0x${chainId.toString(16)}`,
    address: contractAddress.toLowerCase(),
    nonce: `0x${nonce.toString(16)}`,
    ...signEip7702Authorization(
      {
        chainId,
        contractAddress,
        nonce,
      },
      testSigner.privateKey,
    ),
  })

  const referenceUnsignedTx = {
    type: 4,
    chainId: '0x1',
    nonce: '0x311',
    maxPriorityFeePerGas: '0x0',
    maxFeePerGas: '0x0',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: '0xde0b6b3a7640000',
    data: '0x',
    accessList: [],
    authorizationList: [
      {
        address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
        chainId: '0x1',
        nonce: '0x1a4',
        yParity: '0x0',
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
      },
      {
        address: '0x0000000000000000000000000000000000000000',
        chainId: '0xa',
        nonce: '0x45',
        yParity: '0x1',
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
      },
    ],
  }
  const locallySignedAuthorizationTx = {
    ...referenceUnsignedTx,
    authorizationList: [
      createSignedAuthorizationEntry({
        chainId: 1,
        contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        nonce: 420,
      }),
      createSignedAuthorizationEntry({
        chainId: 10,
        contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        nonce: 69,
      }),
    ],
    gas: '0x5208',
  }
  const privateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const common = createCustomCommon({chainId: 1}, Mainnet, {
    hardfork: Hardfork.Prague,
    eips: [7702],
  })

  test('ethEncodeEip7702Transaction', () => {
    expect(ethEncodeEip7702Transaction(referenceUnsignedTx)).toBe(
      '0x04f8e3018203118080809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fef85a0a9400000000000000000000000000000000000000004501a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fea060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
    )
  })

  test('ethSignEip7702Transaction', () => {
    const rawTx = ethSignEip7702Transaction(
      locallySignedAuthorizationTx,
      privateKey,
    )

    expect(rawTx).toBe(
      '0x04f901280182031180808252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0f8baf85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a401a0f6beafe7507f0c98ae9bc8d9e15d6b53c2f0714ccfc01663f658cb9f29caced4a00dc4dfc53537f8b09047eceb674c454acba020ce786d9004175f41669304dee0f85a0a94fba3912ca04dd458c843e2ee08967fc04f3579c24501a0c3fea6e0bd0f5743d6e2f2df8f1aa63ff262a6636ca96ac572da3ea5cd33344ca02a4f006f9a0cf7cd5f5528af86524c984b05a8446c8c124aede1d3531e91de9101a0e620bf170eeec7d7feff500d6711093beafe4815ebefbb29577deef610ecdb97a0752b16af4943b578a4a9d691499ec9aeab85daa350fb50e385379b7e94cfceed',
    )

    const tx = createTxFromRLP(hexToBytes(rawTx), {common})

    expect(tx.getSenderAddress().toString()).toBe(
      testSigner.address.toLowerCase(),
    )
  })
  test('decodes transaction and authorization nonces', () => {
    const rawTx = ethSignEip7702Transaction(
      locallySignedAuthorizationTx,
      privateKey,
    )

    const transaction = decodeEthRawTransaction(rawTx, '0x1')

    expect(transaction).toMatchObject({
      type: '0x4',
      nonce: '0x311',
      from: testSigner.address.toLowerCase(),
    })
    expect(transaction.authorizationList.map(({nonce}) => nonce)).toEqual([
      '0x01a4',
      '0x45',
    ])
  })
})
