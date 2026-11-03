import PropTypes from 'prop-types'
import GasFeeCard from './GasFeeCard'

function GasFeePlaceholder({sponsorshipControl}) {
  return (
    <GasFeeCard
      title={<div className="h-4 w-16 rounded bg-gray-4" />}
      contentClassName="h-[88px] border"
      sponsorshipControl={sponsorshipControl}
    />
  )
}

GasFeePlaceholder.propTypes = {
  sponsorshipControl: PropTypes.object,
}

export default GasFeePlaceholder
