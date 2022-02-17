import PropTypes from 'prop-types'
import {useSWRConfig} from 'swr'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {request, updateDbAccountList} from '../../../utils'
import useAuthorizedAccountIdIcon from './useAuthorizedAccountIdIcon'
import {SlideCard, DisplayBalance, Avatar} from '../../../components'
import {useAccountList, useCurrentAddress} from '../../../hooks/useApi'
import {ROUTES, RPC_METHODS} from '../../../constants'

const {SELECT_CREATE_TYPE} = ROUTES
const {WALLET_SET_CURRENT_ACCOUNT} = RPC_METHODS

function AccountItem({
  nickname,
  currentNetworkId,
  accounts,
  authorizedAccountIdIconObj,
  onClose,
  groupType = '',
}) {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const onChangeAccount = accountId => {
    request(WALLET_SET_CURRENT_ACCOUNT, [accountId])
      .then(() => {
        updateDbAccountList(mutate, 'useCurrentAddress', [
          'queryAllAccount',
          currentNetworkId,
        ]).then(() => {
          onClose && onClose()
          Message.warning({
            content: t('addressHasBeenChanged'),
            top: '110px',
            duration: 1,
          })
        })
      })
      .catch(e => {
        Message.error({
          content:
            e?.message?.split?.('\n')?.[0] ?? e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
      })
  }

  return (
    !!accounts.length && (
      <div className="bg-gray-0 rounded mt-3">
        {groupType === 'pk' ? null : (
          <p className="text-gray-40 ml-4 mb-1 text-xs pt-3">{nickname}</p>
        )}
        {accounts.map(({nickname, eid, selected, nativeBalance, network}) => (
          <div
            aria-hidden="true"
            onClick={() => !selected && onChangeAccount(eid)}
            key={eid}
            className={`flex p-3 rounded hover:bg-primary-4 ${
              selected ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <Avatar
              className="w-5 h-5 mr-2"
              diameter={20}
              accountIdentity={eid}
            />
            <div className="flex-1">
              <p className="text-xs text-gray-40 ">{nickname}</p>
              <div className="flex w-full">
                <DisplayBalance
                  balance={nativeBalance || '0x0'}
                  maxWidthStyle="max-w-[270px]"
                  maxWidth={270}
                  decimals={network?.ticker?.decimals}
                />
                <pre className="text-sm text-gray-80">
                  {network?.ticker?.symbol || ''}
                </pre>
              </div>
            </div>
            <div className="inline-flex justify-center items-center">
              {authorizedAccountIdIconObj[eid] && (
                <div className="w-6 h-6 border-gray-20 border border-solid rounded-full flex justify-center items-center">
                  <img
                    className="w-4 h-4"
                    src={authorizedAccountIdIconObj[eid]}
                    alt="favicon"
                  />
                </div>
              )}
              {selected && (
                <CheckCircleFilled className="w-4 h-4 ml-3 text-success" />
              )}
            </div>
          </div>
        ))}
      </div>
    )
  )
}

AccountItem.propTypes = {
  nickname: PropTypes.string,
  currentNetworkId: PropTypes.number.isRequired,
  accounts: PropTypes.array,
  authorizedAccountIdIconObj: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  groupType: PropTypes.string,
}

function AccountList({onClose, open, accountsAnimate = true}) {
  const {t} = useTranslation()
  const authorizedAccountIdIconObj = useAuthorizedAccountIdIcon()
  const history = useHistory()
  const onAddAccount = () => {
    history.push('?open=account-list')
    history.push(SELECT_CREATE_TYPE)
  }
  const {data: accountGroups} = useAccountList()
  const {
    data: {
      network: {eid: currentNetworkId},
    },
  } = useCurrentAddress()

  return Object.values(accountGroups).length ? (
    <SlideCard
      id="account-list"
      cardTitle={
        <div className="ml-3 pb-1">
          <p className="text-base text-gray-80 font-medium">
            {t('myAccounts')}
          </p>
        </div>
      }
      onClose={onClose}
      open={open}
      needAnimation={accountsAnimate}
      cardContent={
        <div>
          {Object.values(accountGroups).map(
            ({nickname, account, vault, eid}) => (
              <AccountItem
                key={eid}
                accounts={Object.values(account).filter(({hidden}) => !hidden)}
                nickname={nickname}
                currentNetworkId={currentNetworkId}
                onClose={onClose}
                authorizedAccountIdIconObj={authorizedAccountIdIconObj}
                groupType={vault?.type}
              />
            ),
          )}
        </div>
      }
      cardFooter={
        <Button
          id="addAccountBtn"
          color="transparent"
          className="w-full border-dashed border-gray-40 mt-3 text-gray-80 hover:border-primary hover:text-primary"
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
  open: PropTypes.bool.isRequired,
  accountsAnimate: PropTypes.bool,
}

export default AccountList
