import {QuestionCircleOutlined} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {
  CompWithLabel,
  CopyButton,
  CurrentNetworkDisplay,
} from '../../../components'
import PlaintextMessage from './PlaintextMessage'
import ConfirmInfo from './ConfirmInfo'

const METADATA_LABEL_CLASS_NAME = 'w-[112px] shrink-0 text-xs font-normal'
const METADATA_VALUE_CLASS_NAME = 'text-sm font-medium text-gray-80'

const getSignedDomainValues = (typedData, domainTypeName) => {
  const domain = typedData?.domain ?? {}
  const domainFields = typedData?.types?.[domainTypeName] ?? []

  return Object.fromEntries(domainFields.map(({name}) => [name, domain[name]]))
}

export const TypedDataSign = ({
  plaintextData,
  currentNetwork,
  requestOrigin,
  domainTypeName,
}) => {
  const {t} = useTranslation()
  const signedDomain = getSignedDomainValues(plaintextData, domainTypeName)
  const {chainId, verifyingContract} = signedDomain

  const metadataRows = [
    {
      key: 'network',
      label: t('siweKeyNetwork'),
      customValueComponent: (
        <CurrentNetworkDisplay
          containerClassName="min-w-0"
          contentClassName="break-words font-medium"
          currentNetwork={currentNetwork}
        />
      ),
    },
    {
      key: 'requestOrigin',
      label: t('typedDataRequestFrom'),
      value: requestOrigin,
      className: 'break-all',
    },
    {
      key: 'verifyingContract',
      label: (
        <span className="flex min-w-0 items-start">
          <span className="min-w-0">{t('typedDataInteractWith')}</span>
          <Tooltip content={t('typedDataInteractWithTooltip')} placement="top">
            <QuestionCircleOutlined className="ml-1 mt-px h-3.5 w-3.5 shrink-0 cursor-pointer text-gray-40" />
          </Tooltip>
        </span>
      ),
      value: verifyingContract,
      customValueComponent: verifyingContract ? (
        <div className="flex min-w-0 items-center">
          <span className={`min-w-0 break-all ${METADATA_VALUE_CLASS_NAME}`}>
            {shortenAddress(verifyingContract)}
          </span>
          <CopyButton
            text={verifyingContract}
            className="h-3.5 w-3.5 text-gray-60 hover:text-primary"
            containerClassName="relative shrink-0"
            wrapperClassName="ml-1 !h-5 !w-5 shadow-none !bg-transparent hover:!bg-primary-10"
            toastClassName="-top-8 -right-2"
          />
        </div>
      ) : undefined,
    },
    {
      key: 'name',
      label: t('name'),
      value: signedDomain.name,
      className: 'break-words',
    },
    {
      key: 'version',
      label: t('siweKeyVersion'),
      value: signedDomain.version,
      className: 'break-words',
    },
    {
      key: 'chainId',
      label: t('siweKeyChainId'),
      value:
        chainId === undefined || chainId === null ? undefined : `${chainId}`,
      className: 'break-words',
    },
  ]

  return (
    <>
      <CompWithLabel
        label={
          <span
            id="signTypeMsgDes"
            className="text-sm font-medium text-gray-80"
          >
            {t('typedDataReview')}
          </span>
        }
      >
        <div
          id="typedDataMetadata"
          className="overflow-auto break-words rounded bg-gray-4 p-3"
        >
          <div className="flex flex-col gap-3">
            {metadataRows.map(field => (
              <ConfirmInfo
                key={field.key}
                id={field.key}
                label={field.label}
                labelClassName={METADATA_LABEL_CLASS_NAME}
                customValueComponent={field.customValueComponent}
                className={`${METADATA_VALUE_CLASS_NAME} ${
                  field.className ?? ''
                }`}
                value={field.value}
              />
            ))}
          </div>
        </div>
      </CompWithLabel>

      <CompWithLabel
        label={
          <p id="labelDes" className="font-medium">
            {t('message')}
          </p>
        }
      >
        <div
          id="plaintext"
          className="max-h-[140px] overflow-auto break-words rounded bg-gray-4 pb-4 pl-1 pr-3 pt-3"
        >
          <PlaintextMessage message={plaintextData?.message ?? {}} />
        </div>
      </CompWithLabel>
    </>
  )
}

TypedDataSign.propTypes = {
  plaintextData: PropTypes.object.isRequired,
  currentNetwork: PropTypes.object,
  requestOrigin: PropTypes.string,
  domainTypeName: PropTypes.oneOf(['EIP712Domain', 'CIP23Domain']).isRequired,
}
