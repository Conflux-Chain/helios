import PropTypes from 'prop-types'
import {TitleNav, ProgressIcon} from '.'
import {usePendingAuthReq} from '../hooks/useApi'
import {useDappIcon} from '../hooks'
function DappProgressHeader({title}) {
  const pendingAuthReq = usePendingAuthReq()
  const [{app, site}] = pendingAuthReq?.length ? pendingAuthReq : [{}]

  const dappIconUrl = useDappIcon(app?.site?.icon)

  return (
    <header>
      <div id="dappProgressHeader">
        <TitleNav title={title} hasGoBack={false} />
        <div className="flex justify-center items-center mt-1">
          <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center mr-2">
            <img src={dappIconUrl} alt="favicon" className="w-8 h-8" />
          </div>
          <ProgressIcon
            dashLengthStyle="w-[42px]"
            middleIcon={
              <img
                src="/images/paperclip.svg"
                alt="connecting"
                className="w-4 h-4 mx-1"
              />
            }
          />
          <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center ml-2">
            <img className="w-6 h-6" src="/images/logo.svg" alt="logo" />
          </div>
        </div>
        <p
          id="site"
          className="text-base text-gray-80 text-center mt-2 font-medium px-3 text-ellipsis"
        >
          {app?.site?.origin || site?.origin || ''}
        </p>
      </div>
    </header>
  )
}

DappProgressHeader.propTypes = {
  title: PropTypes.string.isRequired,
}
export default DappProgressHeader
