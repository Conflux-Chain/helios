import PropTypes from 'prop-types'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {
  CloseCircleFilled,
  ReloadOutlined,
  SendOutlined,
} from '@fluent-wallet/component-icons'
import {transformToTitleCase} from '../../../utils'
import {
  WrapIcon,
  CopyButton,
  DisplayBalance,
  CustomTag,
} from '../../../components'

const tagColorStyle = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-[#F0FDFC] text-[#83DBC6]',
  pending: 'bg-warning-10 text-warning',
}

function WrapperWithCircle({children, className}) {
  return (
    <div
      className={`${className} flex items-center justify-center	rounded-full w-3 h-3 mr-1`}
    >
      {children}
    </div>
  )
}

WrapperWithCircle.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node]).isRequired,
  className: PropTypes.string,
}

function HistoryItem({itemData}) {
  const {
    status,
    toAddress,
    dappIcon,
    methodName,
    protocol,
    dappUrl,
    amount,
    symbol,
    isDapp,
    nonce,
    time,
  } = itemData
  const tagColor = tagColorStyle[status] ?? ''

  return (
    <div className="px-3 pb-3 pt-2 relative bg-white mx-3 mt-3 rounded">
      {isDapp ? (
        <CustomTag
          className={`${tagColor} absolute flex items-center h-6 px-2.5 left-0 top-0`}
          width="w-auto"
          roundedStyle="rounded-tl rounded-br-lg"
        >
          {status === 'failed' ? (
            <CloseCircleFilled className="w-3 h-3 mr-1" />
          ) : status === 'executed' ? (
            <WrapperWithCircle className="bg-[#83DBC6]">
              <ReloadOutlined className="w-2 h-2 text-white" />
            </WrapperWithCircle>
          ) : status === 'pending' ? (
            <WrapperWithCircle className="bg-[#F0955F]">
              <ReloadOutlined className="w-2 h-2 text-white" />
            </WrapperWithCircle>
          ) : null}
          <span className="text-sm">{transformToTitleCase(status)}</span>
        </CustomTag>
      ) : null}

      <div className="flex justify-between">
        <div>
          {status === 'completed' ? (
            <div className="text-gray-60 text-xs">
              <span>#{nonce}</span>
              <span className="ml-2">{time}</span>
            </div>
          ) : null}
        </div>
        <div className="flex">
          <CopyButton
            text={toAddress}
            className="w-3 h-3 text-primary"
            CopyWrapper={WrapIcon}
            wrapperClassName="!w-5 !h-5"
          />
          {/* TODO: jump scan */}
          <WrapIcon size="w-5 h-5 ml-2" id="openScanUrl" onClick={() => {}}>
            <SendOutlined className="w-3 h-3 text-primary" />
          </WrapIcon>
        </div>
      </div>
      <div className="mt-3 flex items-center">
        <div
          className={`${
            !isDapp ? 'bg-success-10 border-success-10' : 'border-gray-20'
          } w-8 h-8 rounded-full border-solid border flex items-center justify-center mr-2`}
        >
          {isDapp ? (
            <img
              src={dappIcon || '/images/default-dapp-icon.svg'}
              alt="favicon"
              className="w-4 h-4"
            />
          ) : (
            <SendOutlined className="w-4 h-4 text-success" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="w-[120px] text-gray-80 text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
              {methodName}
            </div>
            {amount ? (
              <div className="flex">
                <DisplayBalance
                  balance={amount}
                  maxWidth={114}
                  maxWidthStyle="max-w-[114px]"
                />
                <span className="text-gray-60 ml-0.5">{symbol}</span>
              </div>
            ) : (
              <span className="text-gray-40 text-xs">--</span>
            )}
          </div>
          <div className="flex mt-0.5 items-center justify-between text-gray-40 text-xs">
            <div>{isDapp ? protocol || dappUrl : symbol}</div>
            <div>{shortenAddress(toAddress)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

HistoryItem.propTypes = {
  itemData: PropTypes.object.isRequired,
}
export default HistoryItem
