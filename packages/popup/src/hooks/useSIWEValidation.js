import {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

export const VALIDATOR_KEYS = {
  uri: 'uri',
  address: 'address',
}

const createValidators = t => [
  {
    id: VALIDATOR_KEYS.uri,
    validate: ({parsedMessage, origin}) => {
      try {
        const messageDomain = new URL(parsedMessage.uri).origin
        return messageDomain === origin
      } catch {
        return false
      }
    },
    needConfirm: true,
    getErrorData: () => ({
      title: t('siweWarningUrlTitle'),
      content: t('siweWarningUrl'),
      knownRisk: t('siweWarningKnownRisk'),
    }),
  },
  {
    id: VALIDATOR_KEYS.address,
    validate: ({parsedMessage, address}) => parsedMessage.address === address,
    getErrorData: () => ({
      title: t('siweWarningAccountTitle'),
      content: t('siweWarningAccount'),
    }),
  },
]

export function useSIWEValidation({parsedMessage, origin, address}) {
  const {t} = useTranslation()
  const [errors, setErrors] = useState({})

  const handleConfirmationToggle = useCallback(errorId => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [errorId]: {
        ...prevErrors[errorId],
        isUserConfirmed: !prevErrors[errorId].isUserConfirmed,
      },
    }))
  }, [])

  useEffect(() => {
    if (!parsedMessage) return

    const validators = createValidators(t)
    const newErrors = {}

    for (const validator of validators) {
      if (!validator.validate({parsedMessage, origin, address})) {
        const errorData = validator.getErrorData()

        newErrors[validator.id] = {
          error: true,
          severity: validator.severity,
          needConfirm: validator.needConfirm,
          isUserConfirmed: false,
          ...errorData,
          onConfirmationToggle: validator.needConfirm
            ? () => handleConfirmationToggle(validator.id)
            : undefined,
        }
      }
    }

    setErrors(newErrors)
  }, [parsedMessage, origin, address, t, handleConfirmationToggle])

  return [errors, setErrors]
}
