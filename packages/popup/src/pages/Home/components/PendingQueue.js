import PropTypes from 'prop-types'

function PendingQueue({count}) {
  return <div className="absolute bg-error text-white">{count}+</div>
}

PendingQueue.propTypes = {
  count: PropTypes.number,
}

export default PendingQueue
