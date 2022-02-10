import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import Loading from '@fluent-wallet/component-loading'
import Modal from '@fluent-wallet/component-modal'
import {processError} from '@fluent-wallet/conflux-tx-error'
import {ROUTES, TX_STATUS} from '../../../constants'
import {useCurrentTxParams} from '../../../hooks'

const {HOME} = ROUTES

function HwTransactionResult({status, isDapp, sendError}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {clearSendTransactionParams} = useCurrentTxParams()
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
      closable={false}
      title={title}
      content={
        <div className="flex w-full justify-center max-h-40 overflow-y-auto">
          {content}
        </div>
      }
      icon={
        isRejected ? <CloseCircleFilled className="text-error" /> : <Loading />
      }
      actions={
        isRejected ? (
          <Button
            fullWidth={true}
            onClick={() => {
              clearSendTransactionParams()
              if (!isDapp) history.push(HOME)
              else window.close()
            }}
          >
            {t('ok')}
          </Button>
        ) : null
      }
    />
  )
}

HwTransactionResult.propTypes = {
  status: PropTypes.oneOf(Object.values(TX_STATUS)),
  isDapp: PropTypes.bool,
  sendError: PropTypes.string,
}

export default HwTransactionResult
