import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import DecodedCallArguments from '../../components/DecodedCallArguments'
import {padHexData} from '../../hooks'
import {useDecodedCall} from '../../hooks/useDecodedCall'
import {transformToTitleCase} from '../../utils'
import {TitleNav} from '../../components'

function ViewData({transaction, network, onBack}) {
  const {t} = useTranslation()
  const contractData = padHexData(transaction.data)

  const {decodedCall} = useDecodedCall({
    to: transaction.to,
    data: contractData,
    networkType: network?.type,
    networkId: network?.netId,
  })
  const contractMethod = decodedCall?.name
    ? transformToTitleCase(decodedCall.name)
    : ''
  const args = decodedCall?.args || []
  const inputs = decodedCall?.functionFragment?.inputs || []

  return contractData ? (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat"
    >
      <TitleNav
        title={t('transactionDetails')}
        autoGoBack={false}
        onGoBack={onBack}
      />
      <div
        className="mx-2 mt-3 px-2 py-4 bg-gray-4 flex flex-col flex-1 overflow-y-auto"
        id="content"
      >
        {!!contractMethod && (
          <div>
            <p className="text-xs text-gray-40 mb-0.5">{t('functionName')}</p>
            <div className="text-sm text-gray-80 mb-3">{contractMethod}</div>
          </div>
        )}

        <DecodedCallArguments args={args} inputs={inputs} />

        <div>
          <p className="text-xs text-gray-40 mb-0.5">{t('hexData')}</p>
          <div className="text-sm text-gray-80 mb-3 break-words">
            {contractData}
          </div>
        </div>
      </div>
    </div>
  ) : null
}

ViewData.propTypes = {
  transaction: PropTypes.object.isRequired,
  network: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
}
export default ViewData
