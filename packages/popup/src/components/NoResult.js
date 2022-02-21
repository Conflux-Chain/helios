import PropTypes from 'prop-types'

function NoResult({content}) {
  return (
    <div className="flex px-3 items-center flex-col">
      <img
        src="/images/no-result.svg"
        alt="no result"
        className="w-33 h-24 mt-13 mb-4"
        data-clear-btn="true"
      />
      {content && <p className="text-sm text-gray-40">{content}</p>}
    </div>
  )
}

export default NoResult

NoResult.propTypes = {
  content: PropTypes.string,
}
