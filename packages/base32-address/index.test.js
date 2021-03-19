// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {encode, decode, validateBase32Address} from './'

function verify(hexAddress, netId, base32Address) {
  let verbose = false
  if (base32Address.split(':').length === 3) {
    verbose = true
  }

  const hexBuffer = Buffer.from(hexAddress, 'hex')
  expect(encode(hexBuffer, netId, verbose)).toBe(base32Address)
  expect(decode(base32Address).hexAddress).toStrictEqual(hexBuffer)
  expect(decode(base32Address).netId).toBe(netId)
  if (verbose) {
    expect(`type.${decode(base32Address).type}`).toBe(
      base32Address.split(':')[1].toLowerCase(),
    )
  }
}

describe('@cfxjs/base32-address', function () {
  it('test examples in different types', async function () {
    verify(
      '1a2f80341409639ea6a35bbcab8299066109aa55',
      1029,
      'cfx:aarc9abycue0hhzgyrr53m6cxedgccrmmyybjgh4xg',
    )
    verify(
      '1a2f80341409639ea6a35bbcab8299066109aa55',
      1029,
      'CFX:TYPE.USER:AARC9ABYCUE0HHZGYRR53M6CXEDGCCRMMYYBJGH4XG',
    )
    verify(
      '106d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'cfx:aajg4wt2mbmbb44sp6szd783ry0jtad5bea80xdy7p',
    )
    verify(
      '106d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'CFX:TYPE.USER:AAJG4WT2MBMBB44SP6SZD783RY0JTAD5BEA80XDY7P',
    )
    verify(
      '806d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'cfx:acag4wt2mbmbb44sp6szd783ry0jtad5bex25t8vc9',
    )
    verify(
      '806d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'CFX:TYPE.CONTRACT:ACAG4WT2MBMBB44SP6SZD783RY0JTAD5BEX25T8VC9',
    )
    verify(
      '006d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'cfx:aaag4wt2mbmbb44sp6szd783ry0jtad5beaar3k429',
    )
    verify(
      '006d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'CFX:TYPE.BUILTIN:AAAG4WT2MBMBB44SP6SZD783RY0JTAD5BEAAR3K429',
    )
    verify(
      '0000000000000000000000000000000000000000',
      1029,
      'cfx:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0sfbnjm2',
    )
    verify(
      '0000000000000000000000000000000000000000',
      1029,
      'CFX:TYPE.NULL:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0SFBNJM2',
    )
  })

  it('test examples in different networks', () => {
    verify(
      '106d49f8505410eb4e671d51f7d96d2c87807b09',
      1029,
      'cfx:aajg4wt2mbmbb44sp6szd783ry0jtad5bea80xdy7p',
    )
    verify(
      '806d49f8505410eb4e671d51f7d96d2c87807b09',
      1,
      'cfxtest:acag4wt2mbmbb44sp6szd783ry0jtad5be3xj925gz',
    )
    verify(
      '006d49f8505410eb4e671d51f7d96d2c87807b09',
      10086,
      'net10086:aaag4wt2mbmbb44sp6szd783ry0jtad5benr1ap5gp',
    )
  })
  describe('validateBase32Address', function () {
    it('should return the right validation result', async function () {
      expect(
        validateBase32Address(
          'cfx:aajg4wt2mbmbb44sp6szd783ry0jtad5bea80xdy7p',
          'builtin',
        ),
      ).toBeFalsy()
      expect(
        validateBase32Address(
          'cfx:aajg4wt2mbmbb44sp6szd783ry0jtad5bea80xdy7p',
          1028,
        ),
      ).toBeFalsy()
      expect(
        validateBase32Address(
          'cfx:aajg4wt2mbmbb44sp6szd783ry0jtad5bea80xdy7p',
          1029,
          'user',
        ),
      ).toBeTruthy()
      expect(
        validateBase32Address(
          'ne10086:aaag4wt2mbmbb44sp6szd783ry0jtad5benr1ap5gp',
        ),
      ).toBeFalsy()
    })
  })
})
