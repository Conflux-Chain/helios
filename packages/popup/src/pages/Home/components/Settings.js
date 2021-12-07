import PropTypes from 'prop-types'
import {SlideCard, LanguageNav} from '../../../components'
function Settings({onClose, onOpen}) {
  return (
    <SlideCard
      id="settings"
      onClose={onClose}
      onOpen={onOpen}
      showClose={false}
      cardTitle={
        <LanguageNav hasGoBack={true} showLan={false} color="text-black" />
      }
      cardContent={<div>123</div>}
      direction="horizontal"
      width="w-85"
      height="h-full"
      cardClassName="!rounded-t-none !p-0"
      containerClassName="pl-8"
      backgroundColor="bg-gray-0"
    />
  )
}

Settings.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool.isRequired,
}

export default Settings
