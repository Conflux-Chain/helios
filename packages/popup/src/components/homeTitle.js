import PropTypes from 'prop-types'

const HomeTitle = ({title = '', subTitle = ''}) => {
  return (
    <div className="mx-6">
      <div className="text-2xl text-white h-10">{title}</div>
      <div className="text-sm pt-1 h-4.5">{subTitle}</div>
    </div>
  )
}

HomeTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
}
export default HomeTitle
