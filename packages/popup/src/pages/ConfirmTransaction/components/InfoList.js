import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {convertDataToValue, convertDecimal} from '@fluent-wallet/data-format'
import {useCurrentDapp} from '../../../hooks/useApi'
import {useDappIcon} from '../../../hooks'
import {
  DisplayBalance,
  WrapIcon,
  CurrentNetworkDisplay,
} from '../../../components'
import {bn16} from '../../../utils'
import {MaxUint256} from '@fluent-wallet/consts'
import {BN} from 'bn.js'
import {useMemo} from 'react'

function InfoList({
  isDapp,
  isApproveToken,
  canEditAllowance = false,
  onEditAllowance,

  isSign,
  token,
  value,
  decimals,
  symbol,
  allowance,
  method,
  pendingAuthReq,
}) {
  const {t} = useTranslation()

  const data = useCurrentDapp()

  const [{app}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const currentDapp = isDapp ? app : data?.app
  const currentNetwork = isDapp ? app?.currentNetwork : {}

  const dappIconUrl = useDappIcon(currentDapp?.site?.icon)

  const isUnlimited = useMemo(() => {
    if (!isApproveToken) return false
    try {
      return bn16(MaxUint256).eq(
        new BN(convertDecimal(allowance, 'multiply', token?.decimals)),
      )
    } catch {
      return false
    }
  }, [isApproveToken, allowance, token?.decimals])

  return (
    <div className="info-list-container flex flex-col">
      <div className="flex justify-between mb-4">
        <span className="text-gray-40">{t('network')}</span>
        <CurrentNetworkDisplay
          contentClassName="mr-1"
          currentNetwork={currentNetwork}
        />
      </div>
      {isApproveToken && (
        <div className="flex justify-between mb-4">
          <span className="text-gray-40">{t('allowLimit')}</span>
          <span className="flex items-center">
            <DisplayBalance
              id="allowance"
              balance={allowance}
              isUnlimited={isUnlimited}
              mode="allowance"
              maxWidth={160}
              maxWidthStyle="max-w-[160px]"
              symbol={token?.symbol}
            />
            {canEditAllowance && (
              <WrapIcon className="mx-1 shadow-none !bg-transparent hover:!bg-primary-10 group">
                <EditOutlined
                  className="w-4 h-4 cursor-pointer group-hover:text-primary"
                  id="editAllowance"
                  onClick={onEditAllowance}
                />
              </WrapIcon>
            )}
          </span>
        </div>
      )}
      {isSign && (
        <>
          {!!method && (
            <div className="flex justify-between mb-4">
              <span className="text-gray-40">{t('action')}</span>
              <span className="text-gray-80" id="methodName">
                {method}
              </span>
            </div>
          )}
          {!!value && value !== '0x' && value !== '0x0' && (
            <div className="flex justify-between mb-4">
              <span className="text-gray-40">{t('amount')}</span>
              <span className="text-gray-80" id="amount">
                {`${convertDataToValue(value, decimals)} ${symbol}`}
              </span>
            </div>
          )}
        </>
      )}
      {isDapp && (
        <div className="flex justify-between mb-4">
          <span className="text-gray-40">{t('protocol')}</span>
          <span
            className="text-gray-80 flex items-center max-w-[240px] text-ellipsis"
            id="currentDapp"
          >
            <img
              src={dappIconUrl}
              alt="icon"
              className="w-4 h-4 mr-1 shrink-0"
              id="currentDappIcon"
            />
            {currentDapp?.site?.origin}
          </span>
        </div>
      )}
    </div>
  )
}

InfoList.propTypes = {
  isApproveToken: PropTypes.bool,
  isSign: PropTypes.bool,
  token: PropTypes.object,
  value: PropTypes.string,
  decimals: PropTypes.number,
  symbol: PropTypes.string,
  isDapp: PropTypes.bool,
  allowance: PropTypes.string,
  method: PropTypes.string,
  pendingAuthReq: PropTypes.array,
  canEditAllowance: PropTypes.bool,
  onEditAllowance: PropTypes.func.isRequired,
}

export default InfoList
