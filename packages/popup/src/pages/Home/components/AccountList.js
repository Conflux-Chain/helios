import PropTypes from 'prop-types'
import {useSWRConfig} from 'swr'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled, PlusOutlined} from '@fluent-wallet/component-icons'
import {
  request,
  updateDbAccountList,
  formatLocalizationLang,
} from '../../../utils'
import useAuthorizedAccountIdIcon from './useAuthorizedAccountIdIcon'
import {
  SlideCard,
  DisplayBalance,
  Avatar,
  NoResult,
  WrapIcon,
  StretchInput,
} from '../../../components'
import {useDbAccountListAssets, useCurrentAddress} from '../../../hooks/useApi'
import {RPC_METHODS, ROUTES} from '../../../constants'

const {WALLET_SET_CURRENT_ACCOUNT} = RPC_METHODS
const {SELECT_CREATE_TYPE} = ROUTES

function AccountItem({
  nickname,
  currentNetworkId,
  accounts,
  authorizedAccountIdIconObj,
  onClose,
  groupType = '',
  index,
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
          onClose?.()
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
      <div className={`bg-gray-0 rounded ${index !== 0 ? 'mt-4' : ''}`}>
        {groupType === 'pk' ? null : (
          <div className="flex items-center ml-3 pt-2.5">
            <WrapIcon size="w-5 h-5 mr-1 bg-primary-4" clickable={false}>
              <img src="/images/seed-group-icon.svg" alt="group-icon" />
            </WrapIcon>
            <p className="text-gray-40 text-xs">{nickname}</p>
          </div>
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
  index: PropTypes.number.isRequired,
}

function AccountCardContent({
  currentNetworkId,
  searchedAccountGroup,
  accountGroupData,
  onClose,
}) {
  const {t} = useTranslation()
  const authorizedAccountIdIconObj = useAuthorizedAccountIdIcon()

  return (
    <div>
      {searchedAccountGroup && accountGroupData.length === 0 ? (
        <NoResult content={t('noResult')} imgClassName="mt-[105px]" />
      ) : (
        accountGroupData.map(({nickname, account, vault, eid}, index) => (
          <AccountItem
            key={eid}
            index={index}
            accounts={Object.values(account).filter(({hidden}) => !hidden)}
            nickname={nickname}
            currentNetworkId={currentNetworkId}
            onClose={onClose}
            authorizedAccountIdIconObj={authorizedAccountIdIconObj}
            groupType={vault?.type}
          />
        ))
      )}
    </div>
  )
}
AccountCardContent.propTypes = {
  currentNetworkId: PropTypes.number.isRequired,
  searchedAccountGroup: PropTypes.object,
  accountGroupData: PropTypes.array,
  onClose: PropTypes.func,
}

function AccountList({onClose, open, accountsAnimate = true}) {
  const {i18n, t} = useTranslation()
  const history = useHistory()
  const {
    data: {
      network: {eid: currentNetworkId},
    },
  } = useCurrentAddress()
  const {data: allAccountGroups} = useDbAccountListAssets(currentNetworkId)
  const [searchedAccountGroup, setSearchedAccountGroup] = useState(null)

  const onAddAccount = () => {
    history.push('?open=account-list')
    history.push(SELECT_CREATE_TYPE)
  }

  const accountGroupData = searchedAccountGroup
    ? Object.values(searchedAccountGroup)
    : Object.values(allAccountGroups)

  return Object.values(allAccountGroups).length ? (
    <SlideCard
      id="account-list"
      cardTitle={
        <div className="pb-4">
          <StretchInput
            currentNetworkId={currentNetworkId}
            setSearchedAccountGroup={setSearchedAccountGroup}
            expandWidth="w-4"
            shrinkWidth={
              formatLocalizationLang(i18n.language) === 'en'
                ? 'w-[137px]'
                : 'w-[170px]'
            }
            wrapperClassName="ml-2.5"
            rightNode={
              <WrapIcon
                size="w-5 h-5"
                onClick={onAddAccount}
                id="add-account-btn"
              >
                <PlusOutlined className="w-3 h-3 text-primary" />
              </WrapIcon>
            }
            leftNode={
              <div className="text-base text-gray-80 font-medium">
                {t('myAccounts')}
              </div>
            }
          />
        </div>
      }
      onClose={onClose}
      open={open}
      needAnimation={accountsAnimate}
      cardContent={
        <AccountCardContent
          currentNetworkId={currentNetworkId}
          searchedAccountGroup={searchedAccountGroup}
          accountGroupData={accountGroupData}
          onClose={onClose}
        />
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
