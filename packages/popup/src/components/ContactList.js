import PropTypes from 'prop-types'

import {ContactItem} from './'

function ContactList({
  list = [],
  editMemoId,
  mouseOverItem = {},
  contactSubmitCallback,
  contactClickAwayCallback,
  onMouseOver,
  contactRightComponent,
  onClickContact,
  ...props
}) {
  return (
    <>
      {list?.length > 0 &&
        list.map(({id, gaddr, value}) => (
          <div
            key={id}
            className={`relative ${onClickContact ? 'cursor-pointer' : ''}`}
            aria-hidden="true"
            id={`contact-${id}`}
            {...props}
            onMouseMove={() =>
              mouseOverItem?.memoId !== id &&
              onMouseOver?.({
                memoId: id,
                note: value,
                address: gaddr?.value || '',
              })
            }
            onMouseLeave={() => onMouseOver?.({})}
            onClick={() =>
              onClickContact?.({
                memoId: id,
                note: value,
                address: gaddr?.value || '',
              })
            }
          >
            <ContactItem
              memoId={id}
              address={gaddr?.value}
              memo={value}
              editMemo={editMemoId === id}
              onSubmitCallback={contactSubmitCallback}
              onClickAwayCallback={contactClickAwayCallback}
              rightComponent={
                mouseOverItem?.memoId === id && contactRightComponent
              }
            />
          </div>
        ))}
    </>
  )
}

ContactList.propTypes = {
  editMemoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mouseOverItem: PropTypes.object,
  list: PropTypes.array,
  contactRightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  contactSubmitCallback: PropTypes.func,
  contactClickAwayCallback: PropTypes.func,
  onMouseOver: PropTypes.func,
  onClickContact: PropTypes.func,
}
export default ContactList
