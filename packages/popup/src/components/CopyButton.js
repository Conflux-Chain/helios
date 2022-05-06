import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {CopyOutlined} from '@fluent-wallet/component-icons'
import {WrapIcon} from './index'
import Toast from '@fluent-wallet/component-toast'

function CopyButton({
  text,
  className = '',
  wrapperClassName = '',
  containerClassName = 'relative',
  CopyInner,
  toastClassName = '-top-8 -right-4',
}) {
  const {t} = useTranslation()
  const [copied, setCopied] = useState(false)
  const CopyContent = CopyInner || (
    <CopyOutlined className={`cursor-pointer w-4 h-4 ${className}`} />
  )
  return (
    <div className={containerClassName} id="copyBtn">
      <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
        {wrapperClassName ? (
          <WrapIcon className={wrapperClassName}>{CopyContent}</WrapIcon>
        ) : (
          CopyContent
        )}
      </CopyToClipboard>
      <Toast
        content={t('copiedSuccess')}
        open={copied}
        type="line"
        onClose={() => setCopied(false)}
        className={toastClassName}
      />
    </div>
  )
}

CopyButton.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  toastClassName: PropTypes.string,
  CopyInner: PropTypes.node,
  containerClassName: PropTypes.string,
}

export default CopyButton
