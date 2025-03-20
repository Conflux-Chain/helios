import PropTypes from 'prop-types'
import {CompWithLabel, CurrentNetworkDisplay} from '../../../components'
import {useTranslation} from 'react-i18next'
import {useMemo, useState} from 'react'
import SIWERiskModal from './SIWERiskModal'
import dayjs from 'dayjs'
import ConfirmInfo from './ConfirmInfo'

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
      {
        label: t('siweKeyMessage'),
        key: 'message',
        value: parsedMessage?.statement,
      },
      {
        label: t('siweKeyUri'),
        value: parsedMessage?.uri,
        key: 'uri',
        error: errors?.uri,
      },
      {
        label: t('siweKeyNetwork'),
        key: 'network',
        custom: (
          <CurrentNetworkDisplay
            contentClassName="mr-1"
            currentNetwork={currentNetwork}
          />
        ),
      },
      {
        label: t('siweKeyAddress'),
        value: parsedMessage?.address,
        className: 'break-all',
        key: 'address',
        error: errors?.address,
      },
      {
        label: t('siweKeyVersion'),
        key: 'version',
        value: parsedMessage?.version,
      },
      {
        label: t('siweKeyChainId'),
        key: 'chainId',
        value: parsedMessage?.chainId,
      },
      {label: t('siweKeyNonce'), key: 'nonce', value: parsedMessage?.nonce},
      {
        label: t('siweKeyIssuedAt'),
        key: 'issuedAt',
        value:
          parsedMessage?.issuedAt &&
          dayjs.utc(parsedMessage.issuedAt).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        label: t('siweKeyResources'),
        key: 'resources',
        type: 'array',
        className: 'break-all',
        value: parsedMessage?.resources,
      },
    ]
  }, [parsedMessage, currentNetwork, errors, t])

  const selectedError = errors[modalState.errorKey]

  return (
    <CompWithLabel
      label={
        <span className="text-sm text-gray-80">{t('signWithEthereum')}</span>
      }
    >
      <div
        id="plaintext"
        className="p-3 rounded bg-gray-4 overflow-auto break-words max-h-85"
      >
        <div className="info-list-container flex flex-col gap-4">
          {fields.map(field => (
            <ConfirmInfo
              key={field.label}
              label={field.label}
              error={field.error}
              customValueComponent={field.custom}
              onClick={
                field.error ? () => handleErrorClick(field.key) : undefined
              }
              className={field.className}
              id={field.key}
              value={field.value}
              type={field.type}
            />
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
