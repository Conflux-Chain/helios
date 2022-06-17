import PropTypes from 'prop-types'

import {
  EditOutlined,
  DeleteOutlined,
  PlaneOutlined,
} from '@fluent-wallet/component-icons'
import {CopyButton, WrapIcon} from '../../../components'

function ContactOperation({
  mouseOverItem,
  onClickEdit,
  onClickSend,
  onClickDelete,
}) {
  return (
    <div className="flex">
      <WrapIcon
        onClick={() => onClickEdit?.(mouseOverItem?.memoId)}
        id={`edit-memo-${mouseOverItem?.memoId}`}
        size="w-5 h-5"
      >
        <EditOutlined className="w-[14px] h-[14px] text-primary" />
      </WrapIcon>
      <CopyButton
        text={mouseOverItem?.address}
        className="!w-[14px] !h-[14px] text-primary"
        wrapperClassName="!w-5 !h-5 mx-2"
      />
      <WrapIcon
        onClick={() => onClickSend?.({...mouseOverItem})}
        id={`send-tx-${mouseOverItem?.memoId}`}
        size="w-5 h-5"
        className="mr-2"
      >
        <PlaneOutlined className="w-[14px] h-[14px] text-primary" />
      </WrapIcon>
      <WrapIcon
        onClick={() => onClickDelete?.(mouseOverItem?.memoId)}
        id={`delete-memo-${mouseOverItem?.memoId}`}
        size="w-5 h-5"
      >
        <DeleteOutlined className="w-[14px] h-[14px] text-primary" />
      </WrapIcon>
    </div>
  )
}

ContactOperation.propTypes = {
  mouseOverItem: PropTypes.object,
  address: PropTypes.string,
  onClickEdit: PropTypes.func,
  onClickSend: PropTypes.func,
  onClickDelete: PropTypes.func,
}

export default ContactOperation
