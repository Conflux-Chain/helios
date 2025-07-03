import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import {useDappParams, useDecodeData, padHexData} from '../../hooks'
import {transformToTitleCase} from '../../utils'
import {BigNumber} from '@ethersproject/bignumber'

function ViewData() {
  const {t} = useTranslation()
  const tx = useDappParams()
  const {decodeData} = useDecodeData(tx)
  const {data: contractData} = tx
  const contractMethod = decodeData?.name
    ? transformToTitleCase(decodeData.name)
    : ''
  const args = !contractMethod ? [] : decodeData?.args || []

  return contractData ? (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat"
    >
      <TitleNav title={t('transactionDetails')} />
      <div
        className="mx-2 mt-3 px-2 py-4 bg-gray-4 flex flex-col flex-1 overflow-y-auto no-scroll"
        id="content"
      >
        {!!contractMethod && (
          <div>
            <p className="text-xs text-gray-40 mb-0.5">{t('functionName')}</p>
            <div className="text-sm text-gray-80 mb-3">{contractMethod}</div>
          </div>
        )}
        <div className="mb-3">
          {args.length > 0 &&
            args.map((arg, index) => (
              <div key={index} className="flex flex-col mb-1">
                <span className="text-xs text-gray-40">{`params #${
                  index + 1
                }`}</span>
                <span className="text-sm text-gray-80 break-words">
                  {BigNumber.isBigNumber(arg) ? arg?.toString(10) : arg}
                </span>
              </div>
            ))}
        </div>
        <div>
          <p className="text-xs text-gray-40 mb-0.5">{t('hexData')}</p>
          <div className="text-sm text-gray-80 mb-3 break-words">
            {padHexData(contractData)}
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default ViewData
