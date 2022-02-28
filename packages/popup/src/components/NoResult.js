import PropTypes from 'prop-types'

function NoResult({
  content,
  containerClassName = 'px-3',
  imgClassName = 'mt-13 mb-4',
}) {
  return (
    <div className={`flex items-center flex-col ${containerClassName}`}>
      <img
        src="/images/no-result.svg"
        alt="no result"
        className={`w-33 h-24 ${imgClassName}`}
        data-clear-btn="true"
      />
      {content && <p className="text-sm text-gray-40">{content}</p>}
    </div>
  )
}

export default NoResult

NoResult.propTypes = {
  content: PropTypes.string,
  containerClassName: PropTypes.string,
  imgClassName: PropTypes.string,
}
