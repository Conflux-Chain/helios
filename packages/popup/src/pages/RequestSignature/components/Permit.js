import PermitTokenInfo from '../../../components/PermitTokenInfo'
import {useMemo, useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {
  Security,
  QuestionCircleOutlined,
  RightOutlined,
  FileOutlined,
  UpOutlined,
  DownOutlined,
} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'
import {
  AccountDisplay,
  CopyButton,
  CurrentNetworkDisplay,
  DappFooter,
  TransactionResult,
} from '../../../components'
import {TX_STATUS} from '../../../constants'
import {useAddressTypeInfo} from '../../../hooks/useApi'
import {formatIntoChecksumAddress} from '../../../utils'
import {formatPermitAmount, getPermitDisplayData} from '../../../utils/permit'
import {VIEW_PERMIT_DATA} from '../../../constants/route'
import ImageWithFallback from '../../../components/ImageWithFallback'

const shortenPermitAddress = address => {
  if (!address) return ''

  try {
    return shortenAddress(formatIntoChecksumAddress(address))
  } catch {
    return address
  }
}

const PermitTooltip = ({content, title, placement, children}) => (
  <Tooltip
    content={
      <div className="w-[204px]">
        <div className="mb-1 font-medium text-gray-0">{title}</div>
        <div>{content}</div>
      </div>
    }
    placement={placement}
  >
    {children}
  </Tooltip>
)

PermitTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  placement: PropTypes.string,
}

const PermitRow = ({label, children, className}) => (
  <div className={`flex justify-between ${className || ''}`}>
    <span className="shrink-0 text-sm font-normal text-gray-40">{label}</span>
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1 text-sm font-normal text-gray-80">
      {children}
    </div>
  </div>
)

PermitRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  label: PropTypes.node.isRequired,
}

const PermitTokenAmount = ({amount, amountBits, tokenAddress}) => {
  const {t} = useTranslation()
  return (
    <PermitTokenInfo tokenAddress={tokenAddress}>
      {token => {
        const displayAmount = formatPermitAmount(
          amount,
          token?.decimals,
          amountBits,
          t('unlimited'),
        )
        return (
          <Tooltip content={displayAmount} placement="bottomLeft">
            <span className="truncate">{displayAmount}</span>
          </Tooltip>
        )
      }}
    </PermitTokenInfo>
  )
}

PermitTokenAmount.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  amountBits: PropTypes.number.isRequired,
  tokenAddress: PropTypes.string.isRequired,
}

export const Permit = ({
  address,
  nickname,
  typedData,
  permitDescriptor,
  currentNetwork,
  requestOrigin,
  siteIcon,
  sendStatus,
  sendError,
  setSendError,
  onCloseTransactionResult,
}) => {
  const history = useHistory()
  const {t} = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayData = useMemo(
    () => getPermitDisplayData(typedData, permitDescriptor) || {},
    [permitDescriptor, typedData],
  )
  const {type, eip7702Delegated} = useAddressTypeInfo(displayData.spender)
  const isContract =
    (type === 'contract' || type === 'builtin') && !eip7702Delegated
  const permitName = permitDescriptor?.type === 'permit2' ? 'Permit2' : 'Permit'
  const protocol = requestOrigin || typedData?.domain?.name || '-'
  const verifyingContract = typedData?.domain?.verifyingContract
  const hasMorePermissions = displayData.permissions?.length > 2

  const visiblePermissions = useMemo(() => {
    const permissions = displayData.permissions ?? []
    return isExpanded ? permissions : permissions.slice(0, 2)
  }, [isExpanded, displayData.permissions])

  return (
    <div
      id="permitContainer"
      className="flex h-screen w-full flex-col bg-gray-0 bg-blue-circles bg-no-repeat"
    >
      <main className="flex min-h-0 flex-1 flex-col bg-gray-0">
        <section className="mx-3 mt-3 mb-4 flex min-h-0 flex-1 flex-col gap-4">
          <div
            id="permitCard"
            className="px-3 py-3 pb-6 bg-no-repeat bg-bottom bg-cover rounded-t-[8px]"
            style={{
              backgroundImage: 'url(/images/permit-bg.svg)',
            }}
          >
            <div className="flex items-center justify-center gap-1 text-[16px] leading-[18px] font-medium text-primary mb-4">
              <Security className="h-3 w-3" />
              <span>{t('permitSignatureAuthorization')}</span>
              <span className="rounded bg-[#808BE7] px-1 text-2xs font-medium leading-4 text-white">
                {permitName}
              </span>
              <PermitTooltip
                title={t('permitTooltipTitle')}
                content={t('permitTooltipDescription')}
                placement="bottomLeft"
              >
                <button
                  type="button"
                  aria-label={t('permitTooltipTitle')}
                  className="flex h-4 w-4 items-center justify-center"
                >
                  <QuestionCircleOutlined className="h-4 w-4 text-[#A9ABB2]" />
                </button>
              </PermitTooltip>
            </div>

            <PermitRow label={t('permitSpendingCap')}>
              <div className="max-h-[144px] overflow-y-auto flex flex-col gap-4">
                {visiblePermissions.map((item, index) => {
                  return (
                    <PermitTokenAmount
                      key={index}
                      amount={item.amount}
                      amountBits={displayData.amountBits}
                      tokenAddress={item.token}
                    />
                  )
                })}
              </div>
              {hasMorePermissions && (
                <button
                  type="button"
                  className="flex items-center justify-center text-sm font-normal text-primary w-fit self-end mt-4"
                  onClick={() => setIsExpanded(value => !value)}
                >
                  {t('showMore')}
                  {isExpanded ? (
                    <UpOutlined className="ml-1 h-3 w-3" />
                  ) : (
                    <DownOutlined className="ml-1 h-3 w-3" />
                  )}
                </button>
              )}
            </PermitRow>

            <div className="h-[1px] bg-gray-20 w-full my-3"></div>

            <PermitRow
              label={
                <div className="flex items-center gap-1">
                  <span>{t('permitSpender')}</span>
                  <PermitTooltip
                    title={t('permitSpender')}
                    content={t('permitSpenderTooltip')}
                    placement="bottomRight"
                  >
                    <QuestionCircleOutlined className="mr-1 h-3.5 w-3.5 shrink-0 text-gray-40" />
                  </PermitTooltip>
                </div>
              }
            >
              {isContract && <FileOutlined className="w-4 h-4 text-primary" />}
              <span className="truncate text-[14px] leading-[16px] font-semibold">
                {shortenPermitAddress(displayData.spender) || '-'}
              </span>
              {displayData.spender && (
                <CopyButton
                  text={displayData.spender}
                  className="h-4 w-4 text-gray-60"
                  containerClassName="relative shrink-0"
                  wrapperClassName="!h-4 !w-4 shadow-none !bg-transparent"
                  toastClassName="-top-8 -right-2"
                />
              )}
            </PermitRow>
          </div>
          <div className="flex flex-col gap-4">
            <PermitRow label={t('myAccount')}>
              <AccountDisplay
                address={address}
                nickname={nickname}
                showAvatar={false}
                addressClassName="order-1 text-sm font-normal text-gray-80"
                nicknameClassName="order-2 text-xs font-normal text-gray-60 text-right"
              />
            </PermitRow>
            <PermitRow label={t('network')}>
              <CurrentNetworkDisplay
                containerClassName="min-w-0 justify-end"
                contentClassName="truncate"
                currentNetwork={currentNetwork}
              />
            </PermitRow>

            <PermitRow label={t('protocol')}>
              <ImageWithFallback
                src={siteIcon}
                fallback="/images/default-dapp-icon.svg"
                alt=""
                className="mr-1 h-4 w-4 shrink-0 rounded-full text-right"
              />
              <span className="truncate">{protocol}</span>
            </PermitRow>
            <PermitRow label={t('typedDataInteractWith')}>
              <FileOutlined className="w-4 h-4 text-primary" />
              {shortenPermitAddress(verifyingContract) || '-'}
              <CopyButton
                text={verifyingContract}
                className="h-4 w-4 text-gray-60"
                containerClassName="relative shrink-0"
                wrapperClassName="!h-4 !w-4 shadow-none !bg-transparent"
                toastClassName="-top-8 -right-2"
              />
            </PermitRow>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-end">
            <button
              type="button"
              className="mb-3 flex items-center justify-center text-xs text-primary hover:text-primary-dark"
              onClick={() => history.push(VIEW_PERMIT_DATA)}
            >
              {t('viewData')}
              <RightOutlined className="ml-1 h-3 w-3" />
            </button>
          </div>
        </section>
      </main>

      <div className="shrink-0 bg-gray-0 pb-3">
        <DappFooter
          cancelText={t('cancel')}
          confirmText={t('sign')}
          showError={false}
          setSendError={setSendError}
        />
      </div>

      {sendStatus === TX_STATUS.ERROR && (
        <TransactionResult
          status={sendStatus}
          sendError={sendError}
          onClose={onCloseTransactionResult}
        />
      )}
    </div>
  )
}

Permit.propTypes = {
  currentNetwork: PropTypes.object,
  onCloseTransactionResult: PropTypes.func,
  permitDescriptor: PropTypes.object,
  requestOrigin: PropTypes.string,
  sendError: PropTypes.object,
  sendStatus: PropTypes.string,
  setSendError: PropTypes.func,
  siteIcon: PropTypes.string,
  address: PropTypes.string,
  nickname: PropTypes.string,
  typedData: PropTypes.object.isRequired,
}
