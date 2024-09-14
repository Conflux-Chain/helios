import {expect, describe, it} from 'vitest'
import {validate} from '@fluent-wallet/spec'
import {generateMnemonic, validateMnemonic} from 'bip39'
import {schemas, main} from './'

describe('wallet_generateMnemonic', () => {
  describe('schemas', () => {
    it('should be able to validate mnemonic', () => {
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

  describe('main', () => {
    it('should generate a mnemonic', async () => {
      expect(validateMnemonic(main())).toBeTruthy()
    })
  })
})
