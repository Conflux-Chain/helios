import PropTypes from 'prop-types'
import {Lock} from '@cfxjs/component-icons'

function HomeNav({onLock}) {
  return (
    <nav className="flex h-13 items-center justify-between px-4">
      <img className="w-6 h-6" src="images/logo.svg" alt="logo" />
      <Lock className="w-4 h-4 text-white" onCLick={onLock} />
    </nav>
  )
}
HomeNav.propTypes = {
  onLock: PropTypes.func,
}
export default HomeNav
