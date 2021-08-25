import PropTypes from 'prop-types'

const HomeTitle = ({title = '', subTitle = ''}) => {
  return (
    <header>
      <h1>{title}</h1>
      <h2>{subTitle}</h2>
    </header>
  )
}

HomeTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
}
export default HomeTitle
