import PropTypes from 'prop-types'

const MESSAGE_LABEL_CLASS_NAME = 'text-xs font-normal text-gray-40'
const MESSAGE_VALUE_CLASS_NAME =
  'min-w-0 flex-1 overflow-hidden whitespace-pre-line break-words text-sm font-medium text-gray-80'
const FIXED_LABEL_CLASS_NAME = 'inline-block w-[112px] shrink-0'

const isNestedValue = value => typeof value === 'object' && value !== null

function MessageField({label, value, isArrayEntry}) {
  const isNestedMessage = isNestedValue(value)
  const labelClassName = [
    MESSAGE_LABEL_CLASS_NAME,
    (!isNestedMessage || isArrayEntry) && FIXED_LABEL_CLASS_NAME,
    isArrayEntry && 'pl-4',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`mt-1 pl-2 ${isNestedMessage ? '' : 'flex'}`}>
      <span className={labelClassName}>{label}: </span>
      {isNestedMessage ? (
        <PlaintextMessage message={value} />
      ) : (
        <span className={MESSAGE_VALUE_CLASS_NAME}>{`${value}`}</span>
      )}
    </div>
  )
}

MessageField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  isArrayEntry: PropTypes.bool.isRequired,
}

function PlaintextMessage({message}) {
  const isArray = Array.isArray(message)

  return (
    <div>
      {Object.entries(message).map(([label, value]) => (
        <MessageField
          key={label}
          label={label}
          value={value}
          isArrayEntry={isArray}
        />
      ))}
    </div>
  )
}
PlaintextMessage.propTypes = {
  message: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
}

export default PlaintextMessage
