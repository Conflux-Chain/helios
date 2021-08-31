import PropTypes from 'prop-types'

function TypeItem({title, subTitle, Icon, Tag, onClick, typeClass = ''}) {
  return (
    <div
      className={`flex h-15 bg-white cursor-pointer box-border p-3 ${typeClass}`}
      aria-hidden="true"
      onClick={() => {
        onClick && onClick()
      }}
    >
      <Icon className="w-9 h-9" />
      <div className="ml-2 text-sm">
        <div>
          <span className="text-gray-80">{title}</span>
          {Tag ? <Tag /> : null}
        </div>
        <div className="text-xs text-gray-40">{subTitle}</div>
      </div>
    </div>
  )
}
TypeItem.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
  Tag: PropTypes.elementType,
  typeClass: PropTypes.string,
}
export default TypeItem
