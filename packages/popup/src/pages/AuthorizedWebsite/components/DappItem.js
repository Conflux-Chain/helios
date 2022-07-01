import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Message from '@fluent-wallet/component-message'
import {WrapIcon} from '../../../components'
import {request} from '../../../utils'
import {RPC_METHODS} from '../../../constants'
import useLoading from '../../../hooks/useLoading'
import {useGroupAccountAuthorizedDapps} from '../../../hooks/useApi'
import {useDappIcon} from '../../../hooks'

const {WALLET_REQUEST_PERMISSIONS, WALLET_DELETE_APP} = RPC_METHODS

function DappItem({iconUrl, origin, siteId, appId, accountId, accountSiteId}) {
  const {t} = useTranslation()
  const {setLoading} = useLoading()
  const {mutate} = useGroupAccountAuthorizedDapps()
  const dappIconUrl = useDappIcon(iconUrl)

  const onCancelAuth = () => {
    const method =
      accountSiteId[siteId]?.length === 1
        ? WALLET_DELETE_APP
        : WALLET_REQUEST_PERMISSIONS
    const params =
      accountSiteId[siteId]?.length === 1
        ? {appId}
        : {
            siteId,
            permissions: [{wallet_accounts: {}}],
            accounts: accountSiteId[siteId].filter(id => id !== accountId),
          }

    request(method, params)
      .then(() => {
        mutate().then(() => {
          setLoading(false)
        })
      })
      .catch(e => {
        setLoading(false)
        Message.error({
          content:
            e?.message?.split?.('\n')?.[0] ?? e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
      })
  }

  return (
    <div className="hover:bg-primary-10 flex items-center p-3">
      <WrapIcon className="w-6 h-6 mr-2">
        <img src={dappIconUrl} alt="icon" className="w-4 h-4" />
      </WrapIcon>
      <div className="flex-1 text-gray-80 text-ellipsis">{origin}</div>
      <CloseCircleFilled
        id="cancel-auth"
        className="w-4 h-4 cursor-pointer text-gray-40 text-sm ml-2"
        onClick={onCancelAuth}
      />
    </div>
  )
}

DappItem.propTypes = {
  origin: PropTypes.string.isRequired,
  accountId: PropTypes.number.isRequired,
  siteId: PropTypes.number.isRequired,
  appId: PropTypes.number.isRequired,
  accountSiteId: PropTypes.object.isRequired,
  iconUrl: PropTypes.string,
}

export default DappItem
