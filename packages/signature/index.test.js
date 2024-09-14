import {expect, describe, test} from 'vitest'
// eslint-disable-next-line no-unused-vars
import waitForExpect from 'wait-for-expect'
import {fromPrivate} from '@fluent-wallet/account'
import {
  personalSign,
  signTypedData_v4,
  recoverTypedSignature_v4,
  recoverPersonalSignature,
  getTxHashFromRawTx,
} from './'
import txhash1820 from './1820-txhash'

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
