import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import TokenSpendingCapEditor from '../../components/TokenSpendingCapEditor'

function EditAllowance({
  requestedAmount,
  currentAmount,
  decimals,
  symbol,
  dappOrigin,
  onSave,
  onBack,
}) {
  const {t} = useTranslation()

  return (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
    >
      <TitleNav
        title={t('editPermission')}
        autoGoBack={false}
        onGoBack={onBack}
      />
      <TokenSpendingCapEditor
        requestedAmount={requestedAmount}
        currentAmount={currentAmount}
        decimals={decimals}
        symbol={symbol}
        dappOrigin={dappOrigin}
        onSave={onSave}
      />
    </div>
  )
}

EditAllowance.propTypes = {
  requestedAmount: PropTypes.string.isRequired,
  currentAmount: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  dappOrigin: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}

export default EditAllowance
