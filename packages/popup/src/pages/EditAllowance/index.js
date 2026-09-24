import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Big} from '@fluent-wallet/data-format'
import {TitleNav} from '../../components'
import TokenSpendingCapEditor from '../../components/TokenSpendingCapEditor'
import {usePendingAuthReq} from '../../hooks/useApi'
import {useDecodeData, useCurrentTxParams} from '../../hooks'
import {isEditableTokenApproval} from '../../utils'

function EditAllowance() {
  const {t} = useTranslation()
  const history = useHistory()
  const authReq = usePendingAuthReq()?.[0]
  const tx = authReq?.req.params[0]
  const {decodeData, token} = useDecodeData(tx)
  const {customAllowance, setCustomAllowance} = useCurrentTxParams()
  const {symbol, decimals} = token

  const canEditAllowance = isEditableTokenApproval({
    decodedCall: decodeData,
    token,
  })

  const requestedAmountInBaseUnits = canEditAllowance
    ? decodeData.args[1].toString()
    : null

  const currentAmountInBaseUnits =
    canEditAllowance && customAllowance !== ''
      ? new Big(customAllowance).times(`1e${decimals}`).toFixed()
      : requestedAmountInBaseUnits

  const handleSave = amountInBaseUnits => {
    if (amountInBaseUnits === requestedAmountInBaseUnits) {
      // An empty override keeps the amount requested by the dapp.
      setCustomAllowance('')
    } else {
      const amountInTokenUnits = new Big(amountInBaseUnits)
        .times(`1e-${decimals}`)
        .toFixed()

      setCustomAllowance(amountInTokenUnits)
    }

    history.goBack()
  }

  return (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
    >
      <TitleNav title={t('editPermission')} />
      {canEditAllowance && (
        <TokenSpendingCapEditor
          key={authReq.eid}
          requestedAmount={requestedAmountInBaseUnits}
          currentAmount={currentAmountInBaseUnits}
          decimals={decimals}
          symbol={symbol}
          dappOrigin={authReq.app.site.origin}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default EditAllowance
