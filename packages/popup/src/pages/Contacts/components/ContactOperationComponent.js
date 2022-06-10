import PropTypes from 'prop-types'

import {EditOutlined, DeleteOutlined} from '@fluent-wallet/component-icons'
import {CopyButton, WrapIcon} from '../../../components'

function ContactOperationComponent({
  mouseOverItem,
  onClickEdit,
  onClickSend,
  onClickDelete,
}) {
  return (
    <div className="flex">
      <WrapIcon
        onClick={() => onClickEdit?.(mouseOverItem?.memoId)}
        id="edit-memo"
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
        id="send-tx"
        size="w-5 h-5"
        className="mr-2"
      >
        <img
          src="/images/paper-plane.png"
          alt="send"
          className="w-[14px] h-[14px]"
        />
      </WrapIcon>
      <WrapIcon
        onClick={() => onClickDelete?.(mouseOverItem?.memoId)}
        id="delete"
        size="w-5 h-5"
      >
        <DeleteOutlined className="w-[14px] h-[14px] text-primary" />
      </WrapIcon>
    </div>
  )
}

ContactOperationComponent.propTypes = {
  mouseOverItem: PropTypes.object,
  address: PropTypes.string,
  onClickEdit: PropTypes.func,
  onClickSend: PropTypes.func,
  onClickDelete: PropTypes.func,
}

export default ContactOperationComponent
