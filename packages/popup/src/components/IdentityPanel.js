import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {WrapIcon, CopyButton} from './'
import {EyeInvisibleOutlined, EyeOutlined} from '@fluent-wallet/component-icons'

function IdentityPanel({content, title}) {
  const [eyeStatus, setEyeStatus] = useState('close')
  const [showContent, setShowContent] = useState('')
  useEffect(() => {
    setShowContent(
      eyeStatus === 'close' ? content.replace(/\S/g, '*') : content,
    )
  }, [eyeStatus, content])

  return (
    <div className="bg-identity-panel bg-no-repeat rounded px-3 pt-3 pb-8 bg-gray-0">
      <div className="flex justify-between items-center">
        <div className="text-gray-80 text-sm font-medium">{title}</div>
        <div className="flex items-center">
          <WrapIcon
            size="w-6 h-6 mr-3 rounded-lg"
            id="openScanUrl"
            onClick={() =>
              setEyeStatus(eyeStatus === 'close' ? 'open' : 'close')
            }
          >
            {eyeStatus === 'close' ? (
              <EyeInvisibleOutlined className="w-4 h-4 cursor-pointer text-primary" />
            ) : (
              <EyeOutlined className="w-4 h-4 cursor-pointer text-primary" />
            )}
          </WrapIcon>
          <CopyButton
            text={content}
            className="w-4 h-4 text-primary"
            CopyWrapper={WrapIcon}
            wrapperClassName="!w-6 !h-6 rounded-lg"
            toastClassName="-top-10 -right-3"
          />
        </div>
      </div>
      <div className="break-words text-gray-80 text-sm pt-6">{showContent}</div>
    </div>
  )
}

IdentityPanel.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}
export default IdentityPanel
