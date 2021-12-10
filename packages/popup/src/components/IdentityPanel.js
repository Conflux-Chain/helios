import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {WrapIcon, CopyButton} from './index'
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
    <div>
      <div>
        <div>{title}</div>
        <div>
          <CopyButton
            text={content}
            className="w-3 h-3 text-primary"
            CopyWrapper={WrapIcon}
            wrapperClassName="!w-5 !h-5"
          />
          <WrapIcon
            size="w-5 h-5 ml-2"
            id="openScanUrl"
            onClick={() =>
              setEyeStatus(eyeStatus === 'close' ? 'open' : 'close')
            }
          >
            {eyeStatus === 'close' ? (
              <EyeInvisibleOutlined className="w-4 h-4 cursor-pointer" />
            ) : (
              <EyeOutlined className="w-4 h-4 cursor-pointer" />
            )}
          </WrapIcon>
        </div>
      </div>
      <div>{showContent}</div>
    </div>
  )
}

IdentityPanel.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}
export default IdentityPanel
