import PropTypes from 'prop-types'
import {useSWRConfig} from 'swr'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {ROUTES, RPC_METHODS} from '../../../constants'
import Button from '@fluent-wallet/component-button'
import {CurrentAccountNetworkLabel} from './'
import {request} from '../../../utils'
import useAuthorizedAccountIdIcon from './useAuthorizedAccountIdIcon'
import {SlideCard, DisplayBalance, Avatar} from '../../../components'
import {useDbAccountListAssets} from '../../../hooks/useApi'

const {SELECT_CREATE_TYPE} = ROUTES
const {WALLET_GET_CURRENT_ACCOUNT, WALLET_SET_CURRENT_ACCOUNT} = RPC_METHODS

function AccountItem({
  nickname,
  account,
  authorizedAccountIdIconObj,
  closeAction,
  tokeName = '',
  groupType = '',
  decimals,
}) {
  const {mutate} = useSWRConfig()
  const onChangeAccount = accountId => {
    request(WALLET_SET_CURRENT_ACCOUNT, [accountId]).then(({result}) => {
      result && closeAction && closeAction()
      mutate([WALLET_GET_CURRENT_ACCOUNT])
      // TODO: need deal with error condition
    })
  }

  return (
    <div className="bg-gray-0 rounded mt-3">
      {groupType === 'pk' ? null : (
        <p className="text-gray-40 ml-4 mb-1 text-xs pt-3">{nickname}</p>
      )}
      {account.map(({nickname, eid, currentAddress}, index) => (
        <div
          aria-hidden="true"
          onClick={() => onChangeAccount(eid)}
          key={index}
          className="flex p-3 rounded hover:bg-primary-4 cursor-pointer"
        >
          <Avatar className="w-5 h-5 mr-2" diameter={20} accountId={eid} />
          <div className="flex-1">
            <p className="text-xs text-gray-40 ">{nickname}</p>
            <div className="flex w-full">
              <DisplayBalance
                balance={currentAddress?.nativeBalance || '0'}
                maxWidthStyle="max-w-[270px]"
                maxWidth={270}
                decimals={decimals}
              />
              <pre className="text-sm text-gray-80">{tokeName}</pre>
            </div>
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
  groupType: PropTypes.string,
  decimals: PropTypes.number,
}

function AccountList({onClose, onOpen}) {
  const {t} = useTranslation()
  const authorizedAccountIdIconObj = useAuthorizedAccountIdIcon()
  const history = useHistory()
  const {accountGroups, currentNetwork} = useDbAccountListAssets()
  const ticker = currentNetwork?.ticker
  const onAddAccount = () => {
    history.push('?open=account-list')
    history.push(SELECT_CREATE_TYPE)
  }

  return accountGroups && currentNetwork ? (
    <SlideCard
      cardTitle={t('myAccounts')}
      onClose={onClose}
      onOpen={onOpen}
      cardDescription={<CurrentAccountNetworkLabel />}
      cardContent={
        <div>
          {Object.values(accountGroups || {}).map(
            ({nickname, account, vault}, index) => (
              <AccountItem
                key={index}
                account={Object.values(account || {})}
                nickname={nickname}
                closeAction={onClose}
                authorizedAccountIdIconObj={authorizedAccountIdIconObj}
                tokeName={ticker?.symbol}
                groupType={vault?.type}
                decimals={ticker?.ticker}
              />
            ),
          )}
        </div>
      }
      cardFooter={
        <Button
          id="addAccountBtn"
          color="transparent"
          className="w-full border-dashed border-gray-40 mt-3 text-gray-80"
          onClick={onAddAccount}
        >
          {t('addAccount')}
        </Button>
      }
    />
  ) : null
}

AccountList.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool,
}

export default AccountList
