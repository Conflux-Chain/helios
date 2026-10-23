import PropTypes from 'prop-types'
import classNames from 'classnames'

const PermitRow = ({label, children, nested = false}) => (
  <div className={classNames('flex flex-wrap', nested && 'flex-col gap-4')}>
    <span className="shrink-0 text-sm font-normal text-gray-40 capitalize">
      {label}:
    </span>
    <div
      className={classNames(
        'flex min-w-0 justify-end gap-4 text-sm font-normal text-gray-80 break-all',
        nested ? 'flex-col ml-2' : 'ml-auto',
      )}
    >
      {children}
    </div>
  </div>
)

PermitRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  label: PropTypes.node.isRequired,
  nested: PropTypes.bool,
}

export default PermitRow
