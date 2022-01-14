import PropTypes from 'prop-types'
import {AlignRightOutlined} from '@fluent-wallet/component-icons'

function HomeNav({onClickMenu}) {
  return (
    <nav className="flex h-13 items-center justify-between px-4 z-10 flex-shrink-0">
      <img
        className="w-auto h-5"
        src="/images/logo-horizontal.svg"
        alt="logo"
      />
      <AlignRightOutlined
        className="w-6 h-6 text-white cursor-pointer"
        onClick={() => {
          onClickMenu?.()
        }}
        id="showMenu"
      />
    </nav>
  )
}

HomeNav.propTypes = {
  onClickMenu: PropTypes.func,
}
export default HomeNav
