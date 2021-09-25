import PropTypes from 'prop-types'
import {useSWRConfig} from 'swr'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useRPC} from '@fluent-wallet/use-rpc'
import {isNumber} from '@fluent-wallet/checks'
import {useEffect} from 'react'
import {ROUTES, RPC_METHODS} from '../../../constants'
import Button from '@fluent-wallet/component-button'
import {request} from '../../../utils'
import useAuthorizedAccountIdIcon from './useAuthorizedAccountIdIcon'
import {SlideCard} from '../../../components'
const {SELECT_CREATE_TYPE} = ROUTES
const {
  GET_ACCOUNT_GROUP,
  GET_CURRENT_NETWORK,
  GET_CURRENT_ACCOUNT,
  GET_ACCOUNT_ADDRESS_BY_NETWORK,
  SET_CURRENT_ACCOUNT,
} = RPC_METHODS

function AccountItem({
  nickname,
  account,
  authorizedAccountIdIconObj,
  closeAction,
  tokeName,
}) {
  const {mutate} = useSWRConfig()
  const onChangeAccount = accountId => {
    request(SET_CURRENT_ACCOUNT, [accountId]).then(({result}) => {
      result && closeAction && closeAction()
      mutate([GET_CURRENT_ACCOUNT])
      // TODO: need deal with error condition
    })
  }

  return (
    <div className="bg-gray-0 rounded pt-3 mt-3">
      <p className="text-gray-40 ml-4 mb-1 text-xs">{nickname}</p>
      {account.map(({nickname, eid}, index) => (
        <div
          aria-hidden="true"
          onClick={() => onChangeAccount(eid)}
          key={index}
          className="flex p-3 rounded hover:bg-primary-4 cursor-pointer"
        >
          <img className="w-5 h-5 mr-2" src="" alt="avatar" />
          <div className="flex-1">
            <p className="text-xs text-gray-40">{nickname}</p>
            <p className="text-sm text-gray-80">123455 {tokeName}</p>
          </div>
          {authorizedAccountIdIconObj[eid] ? (
            <div className="w-6 h-6 border-gray-20 border border-solid rounded-full mt-1.5 flex justify-center items-center">
              <img
                className="w-4 h-4"
                src={authorizedAccountIdIconObj[eid]}
                alt="favicon"
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

AccountItem.propTypes = {
  nickname: PropTypes.string,
  account: PropTypes.array,
  authorizedAccountIdIconObj: PropTypes.object.isRequired,
  closeAction: PropTypes.func,
  tokeName: PropTypes.string,
}

function AccountList({cardTitle, onClose, showSlideCard, CardDescription}) {
  const {t} = useTranslation()
  const {data: accountGroups} = useRPC([GET_ACCOUNT_GROUP], undefined, {
    fallbackData: [],
  })
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])
  const ticker = currentNetworkData?.ticker
  const networkId = currentNetworkData?.eid
  const authorizedAccountIdIconObj = useAuthorizedAccountIdIcon()
  const history = useHistory()
  const onAddAccount = () => {
    history.push('?open=account-list')
    history.push(SELECT_CREATE_TYPE)
  }
  // TODO:refactor code and add get balance
  useEffect(() => {
    if (isNumber(networkId) && accountGroups.length) {
      const addressParams = accountGroups.reduce(
        (acc, cur) =>
          acc.concat(
            cur.account
              ? cur.account.map(({eid: accountId}) => ({networkId, accountId}))
              : [],
          ),
        [],
      )
      request(GET_ACCOUNT_ADDRESS_BY_NETWORK, addressParams).then(addresses => {
        console.log('addresses', addresses)
      })
    }
  }, [networkId, accountGroups])
  return (
    <SlideCard
      cardTitle={cardTitle}
      onClose={onClose}
      showSlideCard={showSlideCard}
      CardDescription={CardDescription}
      cardContent={
        <div>
          {accountGroups.map(({nickname, account}, index) => (
            <AccountItem
              key={index}
              account={account || []}
              nickname={nickname}
              closeAction={onClose}
              authorizedAccountIdIconObj={authorizedAccountIdIconObj}
              tokeName={ticker?.name || ''}
            />
          ))}
        </div>
      }
      cardFooter={
        <Button
          color="transparent"
          className="w-full border-dashed border-gray-40 mt-3 text-gray-80"
          onClick={onAddAccount}
        >
          {t('addAccount')}
        </Button>
      }
    />
  )
}

AccountList.propTypes = {
  cardTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showSlideCard: PropTypes.bool,
  CardDescription: PropTypes.elementType,
}

export default AccountList
