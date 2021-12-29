import PropTypes from 'prop-types'
import {CloseOutlined} from '@fluent-wallet/component-icons'

function SeedWord({idx, word, closable = true, onClose, className = ''}) {
  return (
    <div
      id={`seedWordContainer-${idx}`}
      className={`w-25 h-8 mb-3 bg-gray-0 rounded-sm px-1.5 flex items-center justify-start relative ${className}`}
    >
      <span className="text-gray-40 text-2xs w-3 flex items-center mr-1 justify-center">
        {idx}
      </span>
      {word && <span className="text-primary">{word}</span>}
      {closable && word && (
        <CloseOutlined
          id={`close-${idx}-btn`}
          onClick={() => onClose && onClose()}
          className="w-3 h-3 text-gray-40 cursor-pointer absolute right-1.5"
        />
      )}
    </div>
  )
}

SeedWord.propTypes = {
  idx: PropTypes.number.isRequired,
  word: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
}

export default SeedWord
