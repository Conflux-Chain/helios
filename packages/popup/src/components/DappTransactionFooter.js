import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'

function DappTransactionFooter({cancelText, confirmText, onCancel, onConfirm}) {
  return (
    <footer className="flex px-4">
      <Button
        id="cancelBtn"
        className="flex-1"
        variant="outlined"
        key="cancel"
        onClick={onCancel && onCancel()}
      >
        {cancelText}
      </Button>
      <div className="w-3" />
      <Button
        id="confirmBtn"
        className="flex-1"
        onClick={onConfirm && onConfirm()}
      >
        {confirmText}
      </Button>
    </footer>
  )
}

DappTransactionFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
}

export default DappTransactionFooter
