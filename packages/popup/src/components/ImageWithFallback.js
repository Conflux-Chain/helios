import PropTypes from 'prop-types'
import {useEffect, useState} from 'react'

/**
 * Render an image and switch to the fallback source when the primary source fails.
 */
const ImageWithFallback = ({src, fallback, alt, className}) => {
  const [imageSrc, setImageSrc] = useState(src || fallback)

  useEffect(() => {
    setImageSrc(src || fallback)
  }, [fallback, src])

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onError={() => imageSrc !== fallback && setImageSrc(fallback)}
    />
  )
}

ImageWithFallback.propTypes = {
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallback: PropTypes.string.isRequired,
  src: PropTypes.string,
}

export default ImageWithFallback
