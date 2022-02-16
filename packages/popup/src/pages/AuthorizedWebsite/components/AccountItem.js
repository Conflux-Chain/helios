import PropTypes from 'prop-types'
import {useState, useCallback, useEffect} from 'react'
import {DownOutlined} from '@fluent-wallet/component-icons'
import {Avatar} from '../../../components'
import {DappItem} from './'

function AccountItem({accountId, accountNickname, app = [], accountSiteId}) {
  const [showDappItem, setShowDappItem] = useState(false)
  const [dappWrapperHeight, setDappWrapperHeight] = useState(0)
  const dappRef = useCallback(
    node => {
      if (node !== null) {
        setDappWrapperHeight(node.getBoundingClientRect().height)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app.length],
  )

  useEffect(() => {
    if (app.length === 0) {
      setShowDappItem(false)
    }
  }, [app.length])

  return (
    <div className="py-3">
      <div className="flex items-center px-3">
        <Avatar
          className="w-5 h-5 mr-2"
          diameter={20}
          accountIdentity={accountId}
        />
        <div className="flex-1 text-xs text-gray-40">{accountNickname}</div>
        {!!app.length && (
          <DownOutlined
            id="show-dapp"
            className={`w-4 h-4 text-gray-40 cursor-pointer duration-300 ease-in-out transition-all ${
              showDappItem ? 'rotate-180' : 'rotate-0'
            }`}
            onClick={() => setShowDappItem(!showDappItem)}
          />
        )}
      </div>
      <div
        className="overflow-hidden duration-300 ease-in-out transition-all"
        style={{height: `${showDappItem ? dappWrapperHeight : 0}px`}}
      >
        <div ref={dappRef}>
          {app.map(({site, eid}) => (
            <DappItem
              key={eid}
              origin={site?.origin}
              iconUrl={site?.icon}
              siteId={site?.eid}
              appId={eid}
              accountId={accountId}
              accountSiteId={accountSiteId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

AccountItem.propTypes = {
  accountId: PropTypes.number.isRequired,
  accountNickname: PropTypes.string.isRequired,
  accountSiteId: PropTypes.object.isRequired,
  app: PropTypes.array,
}

export default AccountItem
