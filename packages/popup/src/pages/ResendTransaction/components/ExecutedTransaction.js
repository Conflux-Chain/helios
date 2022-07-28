import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'

function ExecutedTransaction({onClose, open}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={() => onClose?.()}
      title={t('cancelTransaction')}
      content={
        <div className="flex items-center justify-center flex-col">
          <img
            className="w-55 h-auto mt-2"
            src="/images/executed-transaction.svg"
            alt="mail"
          />
          <p className="text-gray-60 text-base w-50 text-center mt-3">
            {t('executedTx')}
          </p>
        </div>
      }
      actions={
        <Button fullWidth={true} onClick={() => onClose?.()}>
          {t('ok')}
        </Button>
      }
    />
  )
}

ExecutedTransaction.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}

export default ExecutedTransaction
