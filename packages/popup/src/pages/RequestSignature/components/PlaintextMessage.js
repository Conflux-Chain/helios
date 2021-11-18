import PropTypes from 'prop-types'

function PlaintextMessage({message}) {
  return (
    <div>
      {Object.entries(message).map(([label, value], i) => (
        <div
          className={
            typeof value !== 'object' || value === null
              ? 'pl-2 flex mt-1'
              : 'pl-2 mt-1'
          }
          key={i}
        >
          <span className="text-xs text-gray-40">{label}: </span>
          {typeof value === 'object' && value !== null ? (
            <PlaintextMessage message={value} />
          ) : (
            <span className="text-sm text-gray-80 ml-1 whitespace-pre-line break-words overflow-hidden font-medium">{`${value}`}</span>
          )}
        </div>
      ))}
    </div>
  )
}
PlaintextMessage.propTypes = {
  message: PropTypes.object.isRequired,
}

export default PlaintextMessage
