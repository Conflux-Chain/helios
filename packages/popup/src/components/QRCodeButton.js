import PropTypes from 'prop-types'
import {useState} from 'react'
import QRCode from 'qrcode.react'
import Modal from '@fluent-wallet/component-modal'
import {QrcodeOutlined} from '@fluent-wallet/component-icons'

function QRCodeButton({title, qrcodeValue}) {
  const [qrcodeShow, setQrcodeShow] = useState(false)
  return (
    <>
      <QrcodeOutlined
        onClick={() => setQrcodeShow(true)}
        className="cursor-pointer w-4 h-4 text-white"
      />
      <Modal
        open={qrcodeShow}
        onClose={() => setQrcodeShow(false)}
        content={
          <div className="flex flex-col items-center">
            <span className="text-gray-40 text-xs mb-1">{title}</span>
            <QRCode value={qrcodeValue} size={272} />
            <span className="inline-block w-full mt-2 bg-bg rounded p-2 text-gray-80 break-all">
              {qrcodeValue}
            </span>
          </div>
        }
      />
    </>
  )
}

QRCodeButton.propTypes = {
  title: PropTypes.string.isRequired,
  qrcodeValue: PropTypes.string.isRequired,
}

export default QRCodeButton
