import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import Toast from '@fluent-wallet/component-toast'
import Modal from '@fluent-wallet/component-modal'
import {
  RightOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from '@fluent-wallet/component-icons'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useCurrentAccount} from '../../../hooks'

function CurrentAccount({onOpenAccount}) {
  const [copied, setCopied] = useState(false)
  const [qrcodeShow, setQrcodeShow] = useState(false)
  const {t} = useTranslation()

  const {nickname, address} = useCurrentAccount()
  const displayAddress = address ? shortenAddress(address) : ''

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center cursor-pointer"
        onClick={onOpenAccount}
        aria-hidden="true"
      >
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
CurrentAccount.propTypes = {
  onOpenAccount: PropTypes.func.isRequired,
}
export default CurrentAccount
