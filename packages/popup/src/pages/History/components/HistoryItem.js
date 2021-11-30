import PropTypes from 'prop-types'
import {
  CloseCircleFilled,
  ReloadOutlined,
  SendOutlined,
} from '@fluent-wallet/component-icons'
import {transformToTitleCase} from '../../../utils'
import {WrapIcon, CopyButton} from '../../../components'

const tagColorStyle = {
  failed: 'bg-error-10 text-error',
  executed: 'bg-warning-10 text-warning',
  pending: 'bg-warning-10 text-warning',
}

function Tag({status}) {
  const colorStyle = tagColorStyle[status] ?? ''
  return (
    <div className={`${colorStyle}`}>
      <CloseCircleFilled />
      <span>{transformToTitleCase(status)}</span>
    </div>
  )
}

Tag.propTypes = {
  status: PropTypes.string.isRequired,
}

function HistoryItem({itemData}) {
  const {status, toAddress} = itemData
  return (
    <div>
      <div>
        <Tag status={status} />
        <WrapIcon size="w-5 h-5" id="onCopyAddress" onClick={() => {}}>
          <CopyButton text={toAddress} className="w-4 h-4 text-primary" />
        </WrapIcon>
        <WrapIcon size="w-5 h-5" id="openAddTokenBtn" onClick={() => {}}>
          <SendOutlined className="w-4 h-4 text-primary" />
        </WrapIcon>
      </div>
    </div>
  )
}

HistoryItem.propTypes = {
  itemData: PropTypes.object.isRequired,
}
export default HistoryItem
