import {expect} from '@jest/globals'
import {validate} from '@cfxjs/spec'
import {generateMnemonic, validateMnemonic} from 'bip39'
import {schemas, main} from './'

describe('wallet_generateMnemonic', function () {
  describe('schemas', function () {
    it('should be able to validate mnemonic', function () {
      expect(validate(schemas.output, generateMnemonic())).toBeTruthy()
      expect(
        validate(schemas.output, generateMnemonic().replaceAll(' ', '')),
      ).toBeFalsy()
      expect(
        validate(
          schemas.output,
          'error mom brown point sun magnet armor fish urge business until plastic',
        ),
      ).toBeTruthy()
    })
  })

  describe('main', function () {
    it('should generate a mnemonic', async function () {
      expect(validateMnemonic(main())).toBeTruthy()
    })
  })
})
