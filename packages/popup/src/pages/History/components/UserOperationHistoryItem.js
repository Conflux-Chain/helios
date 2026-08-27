import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {convertDataToValue} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'

import {formatIntoChecksumAddress, transformToTitleCase} from '../../../utils'
import {useCurrentAddress, useCurrentTicker} from '../../../hooks/useApi'
import {useDappIcon, useDecodeData, useServiceName} from '../../../hooks'
import HistoryStatusIcon from './HistoryStatusIcon'
import HistoryBalance from './HistoryBalance'
import TransitionDetail from './TransitionDetail'
import {shouldShowNegativeAmount} from '../amount'

const ICON_COLOR = {
  failed: 'bg-error-10 text-error',
  pending: 'bg-warning-10 text-warning',
  confirmed: 'bg-success-10 text-success',
}

function getHistoryStatus(status, success) {
  if (status === 'pending') return 'pending'
  if (status === 'included') return success ? 'confirmed' : 'failed'
  if (status === 'failed') return 'failed'
  return ''
}

function UserOperationHistoryItem({
  operation,
  transactionUrl,
  copyButtonContainerClassName,
  copyButtonToastClassName,
}) {
  const {t} = useTranslation()
  const [showDetail, setShowDetail] = useState(false)

  const {
    status,
    success,
    created,
    calls,
    app,
    receipt,
    sender,
    nonce,
    paymaster,
    transactionHash,
    error,
  } = operation

  const isSingleCall = calls?.length === 1
  const call = isSingleCall ? calls[0] : {}
  const target = call.to || ''
  const value = call.value || '0x0'
  const data = call.data || '0x'

  const {isContract, token, decodeData} = useDecodeData({to: target, data})
  const dappIconUrl = useDappIcon(app?.site?.icon)
  const {
    symbol: nativeSymbol,
    name: nativeName,
    decimals: nativeDecimals,
  } = useCurrentTicker()
  const {
    data: {network},
  } = useCurrentAddress()

  const methodName = decodeData?.name || ''
  const args = decodeData?.args || []
  const isTokenContract = token?.valid === true
  const isTokenAction =
    isTokenContract &&
    (methodName === 'transfer' ||
      methodName === 'transferFrom' ||
      methodName === 'approve')
  const displayAddressRole = isTokenAction
    ? 'toAddress'
    : isContract
    ? 'contract'
    : 'toAddress'
  const tokenDisplayAddressIndex = methodName === 'transferFrom' ? 1 : 0
  const tokenAmountIndex = methodName === 'transferFrom' ? 2 : 1
  const tokenAmount = isTokenAction
    ? args[tokenAmountIndex]?._hex || args[tokenAmountIndex]
    : undefined
  const displayTarget = isTokenAction
    ? args[tokenDisplayAddressIndex] || target
    : target

  const {data: nsName} = useServiceName({
    type: network?.type,
    netId: network?.netId,
    networkId: network?.eid,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    address: displayTarget,
  })

  const isContractInteraction = !isSingleCall || isContract || data !== '0x'
  const actionName = isContractInteraction
    ? methodName
      ? transformToTitleCase(methodName)
      : '-'
    : t('send')
  const contractName = isContractInteraction
    ? isTokenContract
      ? token.name || t('contractInteraction')
      : t('contractInteraction')
    : nativeName
  const amount = isTokenAction
    ? convertDataToValue(tokenAmount, token.decimals) || ''
    : isContractInteraction
    ? ''
    : convertDataToValue(value, nativeDecimals) || ''
  const symbol = isTokenAction ? token.symbol || '' : nativeSymbol
  const isNegativeAmount = shouldShowNegativeAmount({
    amount,
    methodName,
    methodArgs: args,
    accountAddress: sender,
  })

  const txStatus = getHistoryStatus(status, success)
  const statusIconColor = ICON_COLOR[txStatus] || ''
  const createdTime = dayjs(created).format('YYYY/MM/DD HH:mm:ss')
  const errorMessage = status === 'failed' ? error?.message || '' : ''

  if (!txStatus || !contractName) return null

  return (
    <div className="pt-3">
      <div
        className="flex items-center cursor-pointer p-3 bg-white mx-3 rounded"
        aria-hidden="true"
        onClick={() => setShowDetail(true)}
      >
        <HistoryStatusIcon
          txStatus={txStatus}
          dappIconUrl={dappIconUrl}
          isDapp={!!app}
          className={statusIconColor}
        />

        <div className="flex-1 ml-2">
          <div className="flex items-center justify-between">
            <div className="text-gray-80 text-sm max-w-[120px] text-ellipsis font-medium">
              {actionName}
            </div>
            {amount ? (
              <HistoryBalance
                showNegative={isNegativeAmount}
                amount={amount}
                symbol={symbol}
              />
            ) : (
              <span className="text-gray-40 text-xs">--</span>
            )}
          </div>

          <div className="flex mt-0.5 items-center justify-between text-gray-40 text-xs">
            <span>{contractName}</span>
            <span>
              {nsName ||
                (displayTarget &&
                  shortenAddress(formatIntoChecksumAddress(displayTarget)))}
            </span>
          </div>
        </div>
      </div>

      <TransitionDetail
        open={showDetail}
        onClose={() => setShowDetail(false)}
        txStatus={txStatus}
        statusIconColor={statusIconColor}
        dappIconUrl={dappIconUrl}
        app={app}
        createdTime={createdTime}
        amount={amount}
        symbol={symbol}
        receipt={receipt}
        isExternalTx={false}
        isNegativeAmount={isNegativeAmount}
        fromAddress={sender}
        toAddress={displayTarget}
        displayAddressRole={displayAddressRole}
        nsName={nsName}
        actionName={actionName}
        copyButtonContainerClassName={copyButtonContainerClassName}
        copyButtonToastClassName={copyButtonToastClassName}
        txFeeDrip={receipt?.actualGasCost || '0x0'}
        nonce={nonce}
        hash={transactionHash}
        transactionUrl={transactionUrl}
        errorType={status === 'included' ? 'failed' : 'unknownError'}
        errorMessage={errorMessage}
        gasFeeSymbol={nativeSymbol}
        sponsored={Boolean(paymaster)}
      />
    </div>
  )
}

UserOperationHistoryItem.propTypes = {
  operation: PropTypes.shape({
    status: PropTypes.oneOf(['pending', 'included', 'failed']).isRequired,
    success: PropTypes.bool,
    created: PropTypes.number.isRequired,
    calls: PropTypes.arrayOf(PropTypes.object).isRequired,
    app: PropTypes.object,
    receipt: PropTypes.object,
    sender: PropTypes.string.isRequired,
    nonce: PropTypes.string.isRequired,
    paymaster: PropTypes.string,
    transactionHash: PropTypes.string,
    error: PropTypes.object,
  }).isRequired,
  transactionUrl: PropTypes.string,
  copyButtonContainerClassName: PropTypes.string,
  copyButtonToastClassName: PropTypes.string,
}

export default UserOperationHistoryItem
