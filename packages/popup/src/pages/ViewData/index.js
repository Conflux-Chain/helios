import {useTranslation} from 'react-i18next'
import DecodedCallArguments from '../../components/DecodedCallArguments'
import {TitleNav} from '../../components'
import {padHexData} from '../../hooks'
import {usePendingAuthReq} from '../../hooks/useApi'
import {useDecodedCall} from '../../hooks/useDecodedCall'
import {transformToTitleCase} from '../../utils'

function ViewData() {
  const {t} = useTranslation()
  const authReq = usePendingAuthReq()?.[0]
  const tx = authReq?.req.params[0]
  const network = authReq?.app?.currentNetwork
  const contractData = padHexData(tx?.data)

  const {decodedCall} = useDecodedCall({
    to: tx?.to,
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
      <TitleNav title={t('transactionDetails')} />
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

export default ViewData
