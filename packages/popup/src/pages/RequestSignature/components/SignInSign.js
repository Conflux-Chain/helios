import PropTypes from 'prop-types'
import {CompWithLabel, CurrentNetworkDisplay} from '../../../components'
import {useTranslation} from 'react-i18next'
import {WarningFilled} from '@fluent-wallet/component-icons'
import {useMemo, useState} from 'react'
import SIWERiskModal from './SIWERiskModal'

export const SignInSign = ({parsedMessage, currentNetwork, errors = {}}) => {
  const {t} = useTranslation()

  const [modalState, setModalState] = useState({
    open: false,
  })

  const handleErrorClick = key => {
    if (errors[key]) {
      setModalState({
        open: true,
        errorKey: key,
      })
    }
  }

  const fields = useMemo(() => {
    return [
      {label: 'Message', value: parsedMessage?.statement},
      {
        label: 'URL',
        value: parsedMessage?.uri,
        key: 'uri',
        error: errors?.uri,
      },
      {
        label: 'Network',
        custom: (
          <CurrentNetworkDisplay
            contentClassName="mr-1"
            currentNetwork={currentNetwork}
          />
        ),
      },
      {
        label: 'Account',
        value: parsedMessage?.address,
        className: 'break-all',
        key: 'address',
        error: errors?.address,
      },
      {label: 'Version', value: parsedMessage?.version},
      {label: 'Chain ID', value: parsedMessage?.chainId},
      {label: 'Nonce', value: parsedMessage?.nonce},
      {label: 'Issued', value: parsedMessage?.issuedAt},
    ]
  }, [parsedMessage, currentNetwork, errors])

  const selectedError = errors[modalState.errorKey]

  return (
    <CompWithLabel
      label={
        <span className="text-sm text-gray-80">{t('signWithEthereum')}</span>
      }
    >
      <div
        id="plaintext"
        className="p-3 rounded bg-gray-4 overflow-auto break-words"
      >
        <div className="info-list-container flex flex-col gap-4">
          {fields.map(field => (
            <div className="flex" key={field.label}>
              <span className="text-gray-40 mr-2 w-16">{field.label}</span>
              <div className="flex flex-1">
                {field.error && (
                  <span className="text-red-60 mr-2">
                    <WarningFilled />
                  </span>
                )}
                {field.custom || (
                  <button
                    type="button"
                    className={`${field.className || ''} ${
                      field.error ? 'text-warning cursor-pointer' : ''
                    } text-left`}
                    id={field.key}
                    onClick={() => field.error && handleErrorClick(field.key)}
                  >
                    {field.value}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SIWERiskModal
        open={modalState.open}
        onClose={() => setModalState(prev => ({...prev, open: false}))}
        title={selectedError?.title}
        content={selectedError?.content}
        knownRisk={selectedError?.knownRisk}
        onConfirmationToggle={selectedError?.onConfirmationToggle}
        isUserConfirmed={selectedError?.isUserConfirmed}
      />
    </CompWithLabel>
  )
}

SignInSign.propTypes = {
  parsedMessage: PropTypes.object,
  currentNetwork: PropTypes.object,
  errors: PropTypes.object,
}
