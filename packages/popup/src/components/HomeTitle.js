import PropTypes from 'prop-types'

const HomeTitle = ({title = '', subTitle = '', containerStyle = ''}) => {
  return (
    <div className={`mx-6 ${containerStyle}`}>
      <div className="text-2xl text-white h-10">{title}</div>
      <div className="text-sm h-4.5 text-gray-40">{subTitle}</div>
    </div>
  )
}

HomeTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  containerStyle: PropTypes.string,
}
export default HomeTitle
