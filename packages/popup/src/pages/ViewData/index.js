import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import {useDappParams, useDecodeData} from '../../hooks'
import {transformToTitleCase} from '../../utils'

function ViewData() {
  const {t} = useTranslation()
  const tx = useDappParams()
  const {decodeData, isContract} = useDecodeData(tx)
  const {data: contractData, to} = tx
  const contractMethod = decodeData?.name
    ? decodeData.name === 'unknown'
      ? t('unknown')
      : transformToTitleCase(decodeData.name)
    : '-'

  return contractData ? (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat"
    >
      <TitleNav title={t('transactionDetails')} />
      <div
        className="mx-3 mt-3 px-3 py-4 bg-gray-4 flex flex-col flex-1 overflow-y-auto no-scroll"
        id="content"
      >
        {(isContract || !to) && (
          <div>
            <p className="text-xs text-gray-40 mb-0.5">{t('functionName')}</p>
            <div className="text-sm text-gray-80 mb-3">{contractMethod}</div>
          </div>
        )}
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
