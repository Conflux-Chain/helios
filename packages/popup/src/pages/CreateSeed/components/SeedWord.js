import PropTypes from 'prop-types'
import {Close} from '@cfxjs/component-icons'

function SeedWord({idx, word, closable = true, onClose, className = ''}) {
  return (
    <div
      className={`w-25 h-8 bg-gray-0 rounded-sm px-1.5 flex items-center justify-between relative pl-5 pr-2.5 ${className}`}
    >
      <span className="absolute left-1.5 text-gray-40">{idx}</span>
      <span className="text-primary">{word}</span>
      {closable && (
        <Close
          onClick={() => onClose && onClose()}
          className="w-3 h-3 text-gray-40"
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
