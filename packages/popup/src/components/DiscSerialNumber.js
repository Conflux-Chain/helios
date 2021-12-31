import PropTypes from 'prop-types'

function DiscSerialNumber({serialNumber}) {
  return (
    <div className="w-6 h-6 inline-block border-gray-20 border rounded-full p-px">
      <div className="inline-block text-center text-xs text-gray-0 font-semibold rounded-full bg-success w-5 h-5 leading-[20px]">
        {serialNumber}
      </div>
    </div>
  )
}

DiscSerialNumber.propTypes = {
  serialNumber: PropTypes.string.isRequired,
}

export default DiscSerialNumber
