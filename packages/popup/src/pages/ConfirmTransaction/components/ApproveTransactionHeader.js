import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {
  EditOutlined,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import {useAddressTypeInfo} from '../../../hooks/useApi'
import {bn16} from '../../../utils'
import {
  DisplayBalance,
  CopyButton,
  AddressDisplay,
  WrapIcon,
} from '../../../components'
import {useMemo} from 'react'
import {BN} from 'bn.js'
import {convertDecimal} from '@fluent-wallet/data-format'
import {MaxUint256} from '@fluent-wallet/consts'
import Tooltip from '@fluent-wallet/component-tooltip'

function ApproveTransactionHeader({
  spenderAddress,
  allowance,
  canEditAllowance,
  onEditAllowance,
  token,
}) {
  const {t} = useTranslation()

  const {type, eip7702Delegated} = useAddressTypeInfo(spenderAddress)
  const isContract =
    !eip7702Delegated && (type === 'contract' || type === 'builtin')

  const isUnlimited = useMemo(() => {
    try {
      return bn16(MaxUint256).eq(
        new BN(convertDecimal(allowance, 'multiply', token?.decimals)),
      )
    } catch {
      return false
    }
  }, [allowance, token?.decimals])

  return (
    <div
      id="approve-card"
      className="p-4 pb-6 bg-no-repeat bg-bottom bg-cover rounded-t-[8px] mb-4"
      style={{
        backgroundImage: 'url(/images/signature-request-bg.svg)',
      }}
    >
      <div className="relative flex items-center justify-center gap-1 text-[16px] leading-[18px] font-medium text-primary mb-4">
        <img
          alt="icon"
          className="w-3 h-3 mr-1"
          src="/images/approve-token-icon.svg"
        />
        <span>{t('approveToken')}</span>
      </div>

      <div className="relative flex justify-between">
        <span className="shrink-0 text-sm font-normal text-gray-40">
          {t('spendingCap')}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 text-sm font-normal text-gray-80">
          {canEditAllowance && (
            <WrapIcon className="mx-1 shadow-none !bg-transparent hover:!bg-primary-10 group">
              <EditOutlined
                className="w-4 h-4 cursor-pointer group-hover:text-primary"
                id="editAllowance"
                onClick={onEditAllowance}
              />
            </WrapIcon>
          )}
          <DisplayBalance
            id="allowance"
            balance={allowance}
            isUnlimited={isUnlimited}
            mode="allowance"
            maxWidth={160}
            maxWidthStyle="max-w-[160px]"
          />
          {token && (
            <AddressDisplay
              address={token.address}
              iconUrl={token.logoURI}
              name={token.name}
              symbol={token.symbol}
              kind="token"
              iconClassName="w-4 h-4"
            />
          )}
        </div>
      </div>
      <div className="relative h-[1px] bg-gray-20 w-full my-3"></div>
      <div className="relative flex justify-between">
        <div className="shrink-0 text-sm font-normal text-gray-40 flex items-center gap-1">
          {t('spender')}
          <Tooltip
            placement="top"
            trigger={['hover', 'focus']}
            content={<p className="w-60">{t('permitSpenderTooltip')}</p>}
          >
            <button
              type="button"
              aria-label={t('spender')}
              className="flex h-4 w-4 items-center justify-center"
            >
              <QuestionCircleOutlined className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 text-sm font-normal text-gray-80">
          <AddressDisplay
            address={spenderAddress}
            kind="contract"
            iconClassName="w-4 h-4"
            labelClassName="font-semibold"
            showIcon={isContract}
            autoFetch={isContract}
          />
          {spenderAddress && (
            <CopyButton
              text={spenderAddress}
              className="h-4 w-4 text-gray-60"
              containerClassName="relative shrink-0"
              wrapperClassName="!h-4 !w-4 shadow-none !bg-transparent"
              toastClassName="-top-8 -right-2"
            />
          )}
        </div>
      </div>
    </div>
  )
}

ApproveTransactionHeader.propTypes = {
  spenderAddress: PropTypes.string,
  allowance: PropTypes.string,
  canEditAllowance: PropTypes.bool,
  onEditAllowance: PropTypes.func.isRequired,

  token: PropTypes.object,
}

export default ApproveTransactionHeader
