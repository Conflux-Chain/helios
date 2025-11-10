import {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

export const VALIDATOR_KEYS = {
  address: 'address',
  domain: 'domain',
}

export const parseDomainParts = (domain, originProtocol) => {
  if (domain.match(/^[^/:]*:\/\//u)) {
    return new URL(domain)
  }
  return new URL(`${originProtocol}//${domain}`)
}

const createValidators = t => [
  {
    id: VALIDATOR_KEYS.domain,
    validate: ({parsedMessage, origin}) => {
      try {
        if (!parsedMessage.domain || !origin) return false

        let originURL
        try {
          originURL = new URL(origin)
        } catch {
          // The origin from app.site.origin doesn't include protocol information,
          // so we add a default protocol (https://) just for URL parsing.
          // Note: We skip protocol comparison since the original origin doesn't provide it.
          originURL = new URL(`https://${origin}`)
        }

        const domainURL = parseDomainParts(
          parsedMessage.domain,
          originURL.protocol,
        )

        if (
          domainURL.hostname.localeCompare(originURL.hostname, undefined, {
            sensitivity: 'variant',
          }) !== 0
        ) {
          return false
        }

        if (
          domainURL.username !== '' &&
          domainURL.username !== originURL.username
        ) {
          return false
        }

        return true
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
    validate: ({parsedMessage, address}) =>
      parsedMessage.address?.toLowerCase() === address?.toLowerCase(),
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
