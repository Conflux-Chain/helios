import PropTypes from 'prop-types'

function PendingQueue({count = ''}) {
  return (
    <div
      id="queueContainer"
      className="absolute bg-error text-white text-2xs px-1 rounded-lg	leading-3 right-0 -top-1.5 translate-x-2/4"
    >
      {count}
    </div>
  )
}

PendingQueue.propTypes = {
  count: PropTypes.string,
}

export default PendingQueue
