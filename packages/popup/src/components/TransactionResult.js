import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import Loading from '@fluent-wallet/component-loading'
import Modal from '@fluent-wallet/component-modal'
import {processError} from '@fluent-wallet/conflux-tx-error'
import {CopyButton} from '../components'
import {TX_STATUS} from '../constants'

function TransactionResult({status, sendError, onClose}) {
  const {t} = useTranslation()
  const [zendeskTimer, setZendeskTimer] = useState(null)
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

  const onClickFeedback = () => {
    const timer = setTimeout(() => {
      zendeskTimer && clearTimeout(zendeskTimer)
      setZendeskTimer(null)
      window.open('https://fluent-wallet.zendesk.com/hc/en-001/requests/new')
    }, 900)
    setZendeskTimer(timer)
  }

  return (
    <Modal
      open={open}
      closable={!isWaiting}
      onClose={() => !isWaiting && onClose?.()}
      title={title}
      content={
        <div className="flex flex-col w-full items-center">
          <div className="flex w-full justify-center overflow-y-auto max-h-40 mb-4">
            {content}
          </div>
          {!isWaiting && !isRejected && (
            <CopyButton
              text={content}
              toastClassName="left-2/4 transform -translate-x-2/4 -top-8"
              CopyInner={
                <div
                  id="feedback"
                  aria-hidden="true"
                  className="text-center text-xs text-primary cursor-pointer"
                  onClick={onClickFeedback}
                >
                  {t('feedBackCode')}
                </div>
              }
            />
          )}
        </div>
      }
      icon={
        !isWaiting ? <CloseCircleFilled className="text-error" /> : <Loading />
      }
      actions={
        !isWaiting ? (
          <Button
            fullWidth={true}
            onClick={() => {
              onClose?.()
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
  onClose: PropTypes.func,
}

export default TransactionResult
