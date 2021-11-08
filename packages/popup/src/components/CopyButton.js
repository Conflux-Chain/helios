import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {CopyOutlined} from '@fluent-wallet/component-icons'
import Toast from '@fluent-wallet/component-toast'

function CopyButton({text, className = ''}) {
  const {t} = useTranslation()
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative">
      <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
        <CopyOutlined className={`cursor-pointer w-4 h-4 ${className}`} />
      </CopyToClipboard>
      <Toast
        content={t('copiedSuccess')}
        open={copied}
        type="line"
        onClose={() => setCopied(false)}
        className="-top-9 left-0"
      />
    </div>
  )
}

CopyButton.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
}

export default CopyButton
