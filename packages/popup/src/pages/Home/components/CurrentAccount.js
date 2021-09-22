import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import Toast from '@fluent-wallet/component-toast'
import Modal from '@fluent-wallet/component-modal'
import {useRPC} from '@fluent-wallet/use-rpc'
import {
  RightOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {RPC_METHODS, NETWORK_TYPE} from '../../../constants'
const {
  GET_CURRENT_ACCOUNT,
  GET_CURRENT_NETWORK,
  GET_ACCOUNT_ADDRESS_BY_NETWORK,
} = RPC_METHODS

function CurrentAccount() {
  const [copied, setCopied] = useState(false)
  const [qrcodeShow, setQrcodeShow] = useState(false)
  const {t} = useTranslation()

  const {data: currentNetwork} = useRPC([GET_CURRENT_NETWORK], undefined, {
    fallbackData: {},
  })
  const {eid: networkId, type} = currentNetwork

  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })
  const {nickname, eid: accountId} = currentAccount

  const {data: accountAddress} = useRPC(
    accountId !== undefined && networkId !== undefined
      ? [GET_ACCOUNT_ADDRESS_BY_NETWORK, accountId, networkId]
      : null,
    {accountId, networkId},
    {fallbackData: {}},
  )
  const {base32, hex} = accountAddress

  const address =
    type === NETWORK_TYPE.CFX ? base32 : type === NETWORK_TYPE.ETH ? hex : ''
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col">
      <div className="flex items-center cursor-pointer">
        <span className="text-xs text-gray-40 mr-2">{nickname}</span>
        <RightOutlined className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center">
        <span className="text-white font-medium mr-2">{displayAddress}</span>
        <div className="relative">
          <CopyToClipboard text={address} onCopy={() => setCopied(true)}>
            <CopyOutlined className="cursor-pointer w-4 h-4 mg-2 text-white" />
          </CopyToClipboard>
          <Toast
            content={t('copiedSuccess')}
            open={copied}
            type="line"
            onClose={() => setCopied(false)}
            className="-top-9 left-0"
          />
        </div>
        <QrcodeOutlined
          onClick={() => setQrcodeShow(true)}
          className="cursor-pointer w-4 h-4 text-white"
        />
      </div>
      <Modal
        open={qrcodeShow}
        onClose={() => setQrcodeShow(false)}
        content={
          <div className="flex flex-col items-center">
            <span className="text-gray-40 text-xs mb-1">{nickname}</span>
            <QRCode value={address} size={272} />
            <span className="inline-block w-full mt-2 bg-bg rounded p-2 text-gray-80 break-all">
              {address}
            </span>
          </div>
        }
      />
    </div>
  )
}

export default CurrentAccount
