import PropTypes from 'prop-types'

function TypeItem({title, subTitle, Icon, Tag, onclick}) {
  return (
    <div
      className="flex h-15 my-3"
      aria-hidden="true"
      onClick={onclick && onclick()}
    >
      {Icon}
      <div className="ml-2">
        <div>
          <span className="text-sm">{title}</span>
          {Tag ? Tag : null}
        </div>
        <div className="text-xs">{subTitle}</div>
      </div>
    </div>
  )
}
TypeItem.propTypes = {
  onclick: PropTypes.func,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
  Tag: PropTypes.node,
}
export default TypeItem
