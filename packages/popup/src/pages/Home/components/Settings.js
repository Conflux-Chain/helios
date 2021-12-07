import PropTypes from 'prop-types'
import {SlideCard} from '../../../components'

function Settings({onClose, onOpen}) {
  return (
    <SlideCard
      id="settings"
      onClose={onClose}
      onOpen={onOpen}
      showClose={false}
      cardContent={<div id="settings">123</div>}
      direction="horizontal"
    />
  )
}

Settings.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool.isRequired,
}

export default Settings
