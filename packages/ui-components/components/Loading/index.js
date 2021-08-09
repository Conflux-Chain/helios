import PropTypes from 'prop-types'
import {Loading as LoadingSvg} from '../../assets/svg'

function Loading({className = ''}) {
  return (
    <LoadingSvg
      className={`animate-spin text-gray-20 w-12 h-12 ${className}`}
    />
  )
}

export default Loading

Loading.propTypes = {
  className: PropTypes.string,
}
