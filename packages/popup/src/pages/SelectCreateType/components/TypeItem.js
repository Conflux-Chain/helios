import PropTypes from 'prop-types'

function TypeItem({title, subTitle, Icon, Tag, onClick}) {
  return (
    <div
      className="flex h-15 my-3 cursor-pointer"
      aria-hidden="true"
      onClick={() => {
        onClick && onClick()
      }}
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
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
  Tag: PropTypes.node,
}
export default TypeItem
