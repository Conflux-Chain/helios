import PropTypes from 'prop-types'

import {ContactItem} from './'

function ContactList({
  list = [],
  editMemoId,
  mouseOverId,
  contactSubmitCallback,
  contactClickAwayCallback,
  onMouseOver,
  contactRightComponent,
  ...props
}) {
  return (
    <>
      {list?.length > 0 &&
        list.map(({id, gaddr, value}) => (
          <div
            key={id}
            className="relative"
            {...props}
            onMouseEnter={() => onMouseOver?.(id, gaddr?.value || '')}
            onMouseLeave={() => onMouseOver?.('', '')}
          >
            <ContactItem
              memoId={id}
              address={gaddr?.value}
              memo={value}
              editMemo={editMemoId === id}
              onSubmitCallback={contactSubmitCallback}
              onClickAwayCallback={contactClickAwayCallback}
              rightComponent={mouseOverId === id && contactRightComponent}
            />
          </div>
        ))}
    </>
  )
}

ContactList.propTypes = {
  editMemoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mouseOverId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  list: PropTypes.array,
  contactRightComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  contactSubmitCallback: PropTypes.func,
  contactClickAwayCallback: PropTypes.func,
  onMouseOver: PropTypes.func,
}
export default ContactList
