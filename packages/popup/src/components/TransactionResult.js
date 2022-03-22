import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import Loading from '@fluent-wallet/component-loading'
import Modal from '@fluent-wallet/component-modal'
import {processError} from '@fluent-wallet/conflux-tx-error'
import {TX_STATUS} from '../constants'

function TransactionResult({status, sendError, onReject}) {
  const {t} = useTranslation()
  const open = status && status !== TX_STATUS.HW_SUCCESS
  const isRejected = sendError?.includes('UserRejected')
  const isWaiting = status === TX_STATUS.HW_WAITING
  const {errorType} = processError(sendError)
  const title = isWaiting
    ? t('waitingForSign')
    : isRejected
    ? t('rejected')
    : t(errorType)

  const content = isWaiting
    ? t('waitingContent')
    : isRejected
    ? t('rejectedContent')
    : sendError

  return (
    <Modal
      open={open}
      closable={!isWaiting}
      onClose={() => !isWaiting && onReject?.()}
      title={title}
      content={
        <div className="flex w-full justify-center max-h-40 overflow-y-auto">
          {content}
        </div>
      }
      icon={
        !isWaiting ? <CloseCircleFilled className="text-error" /> : <Loading />
      }
      actions={
        isRejected ? (
          <Button
            fullWidth={true}
            onClick={() => {
              onReject?.()
            }}
          >
            {t('ok')}
          </Button>
        ) : null
      }
    />
  )
}

TransactionResult.propTypes = {
  status: PropTypes.oneOf(Object.values(TX_STATUS)),
  sendError: PropTypes.string,
  onReject: PropTypes.func,
}

export default TransactionResult
