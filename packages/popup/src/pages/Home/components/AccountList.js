import PropTypes from 'prop-types'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled, PlusOutlined} from '@fluent-wallet/component-icons'
import {request, formatLocalizationLang} from '../../../utils'
import useAuthorizedAccountIdIcon from './useAuthorizedAccountIdIcon'
import {
  SlideCard,
  DisplayBalance,
  NoResult,
  WrapIcon,
  StretchInput,
  AccountGroupItem,
  AccountItem,
} from '../../../components'
import {useAccountList, useCurrentAddress} from '../../../hooks/useApi'
import {RPC_METHODS, ROUTES} from '../../../constants'

const {WALLET_SET_CURRENT_ACCOUNT} = RPC_METHODS
const {SELECT_CREATE_TYPE} = ROUTES

function AccountCardContent({
  searchedAccountGroup,
  accountGroupData,
  onChangeAccount,
}) {
  const {t} = useTranslation()
  const authorizedAccountIdIconObj = useAuthorizedAccountIdIcon()

  return (
    <div id="home-account-list">
      {searchedAccountGroup && accountGroupData.length === 0 ? (
        <NoResult content={t('noResult')} imgClassName="mt-[105px]" />
      ) : (
        accountGroupData.map(
          (
            {nickname: groupNickname, account, vault, eid: accountGroupId},
            index,
          ) => (
            <AccountGroupItem
              key={accountGroupId}
              className={`!mx-0 ${index !== 0 ? 'mt-4' : ''}`}
              groupContainerClassName="!mb-0"
              nickname={groupNickname}
              groupType={vault?.type}
            >
              {Object.values(account).map(
                ({
                  nickname: accountNickname,
                  eid: accountId,
                  selected,
                  currentAddress: {nativeBalance, network, value},
                }) => (
                  <AccountItem
                    key={accountId}
                    className={`!p-3  ${
                      selected ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    accountId={accountId}
                    address={value}
                    accountNickname={accountNickname}
                    onClickAccount={() =>
                      !selected && onChangeAccount?.(accountId)
                    }
                    AccountNameOverlay={
                      <div className="w-full">
                        <p className="text-xs text-gray-40 ">
                          {accountNickname}
                        </p>
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
                    }
                    rightComponent={
                      <div className="inline-flex justify-center items-center">
                        {authorizedAccountIdIconObj[accountId] && (
                          <div className="w-6 h-6 border-gray-20 border border-solid rounded-full flex justify-center items-center">
                            <img
                              className="w-4 h-4"
                              src={authorizedAccountIdIconObj[accountId]}
                              alt="favicon"
                            />
                          </div>
                        )}
                        {selected && (
                          <CheckCircleFilled className="w-4 h-4 ml-3 text-success" />
                        )}
                      </div>
                    }
                  />
                ),
              )}
            </AccountGroupItem>
          ),
        )
      )}
    </div>
  )
}
AccountCardContent.propTypes = {
  searchedAccountGroup: PropTypes.object,
  accountGroupData: PropTypes.array,
  onChangeAccount: PropTypes.func,
}

function AccountList({onClose, open, accountsAnimate = true}) {
  const {i18n, t} = useTranslation()
  const history = useHistory()
  const {
    data: {
      network: {eid: currentNetworkId},
    },
    mutate: refreshCurrentAddress,
  } = useCurrentAddress()
  const {data: allAccountGroups, mutate: refreshAccountGroups} = useAccountList(
    {networkId: currentNetworkId},
  )
  const [searchedAccountGroup, setSearchedAccountGroup] = useState(null)
  // to refresh searched data
  const [refreshDataStatus, setRefreshDataStatus] = useState(false)

  const onChangeAccount = async accountId => {
    try {
      await request(WALLET_SET_CURRENT_ACCOUNT, [accountId])
      setRefreshDataStatus(!refreshDataStatus)
      await Promise.all([refreshCurrentAddress(), refreshAccountGroups()])
      onClose?.()
    } catch (e) {
      Message.error({
        content:
          e?.message?.split?.('\n')?.[0] ?? e?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
    }
  }

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
        <StretchInput
          currentNetworkId={currentNetworkId}
          refreshDataStatus={refreshDataStatus}
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
      }
      onClose={onClose}
      open={open}
      needAnimation={accountsAnimate}
      cardContent={
        <AccountCardContent
          searchedAccountGroup={searchedAccountGroup}
          accountGroupData={accountGroupData}
          onClose={onClose}
          onChangeAccount={onChangeAccount}
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
