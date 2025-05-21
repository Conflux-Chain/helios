import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import {isArray} from '@fluent-wallet/checks'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Modal from '@fluent-wallet/component-modal'
import {
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import {
  NetworkContent,
  DappProgressHeader,
  DappFooter,
  CompWithLabel,
  NoResult,
  StretchInput,
  AccountGroupItem,
  AccountItem,
} from '../../components'
import {formatLocalizationLang, formatIntoChecksumAddress} from '../../utils'
import {
  useAccountList,
  useCurrentAddress,
  usePendingAuthReq,
} from '../../hooks/useApi'

function ConnectSitesList({
  allAccountGroupData,
  onSelectSingleAccount,
  checkboxStatusObj,
  currentNetworkId,
}) {
  const {t, i18n} = useTranslation()
  const [searchedAccountGroup, setSearchedAccountGroup] = useState(null)

  const accountGroupData = searchedAccountGroup
    ? Object.values(searchedAccountGroup)
    : allAccountGroupData

  return (
    <>
      <CompWithLabel
        label={
          <StretchInput
            currentNetworkId={currentNetworkId}
            setSearchedAccountGroup={setSearchedAccountGroup}
            expandWidth="w-4"
            shrinkWidth={
              formatLocalizationLang(i18n.language) === 'en'
                ? 'w-[114px]'
                : 'w-[184px]'
            }
            inputClassName="!bg-gray-10"
            leftNode={
              <div className="flex items-center">
                <div className="text-sm text-gray-40">
                  {t('selectAuthorizedAccounts')}
                </div>
                <QuestionCircleOutlined
                  onClick={() =>
                    window &&
                    window.open(
                      'https://fluent-wallet.zendesk.com/hc/en-001/articles/4414146678555-Account-authorization',
                    )
                  }
                  className="w-4 h-4 text-gray-40 ml-2 cursor-pointer"
                  id="open-account-authorization"
                />
              </div>
            }
          />
        }
      >
        <div
          id="accountWrapper"
          className="max-h-[272px] rounded overflow-auto no-scroll"
        >
          {searchedAccountGroup && accountGroupData.length === 0 ? (
            <NoResult content={t('noResult')} containerClassName="h-[262px]" />
          ) : (
            accountGroupData.map(
              ({nickname: groupNickname, account, vault, eid}, index) => (
                <AccountGroupItem
                  key={eid}
                  nickname={groupNickname}
                  groupType={vault?.type}
                  className={`${
                    index === 0 ? '' : 'mt-2'
                  } bg-gray-4 border border-solid border-gray-10`}
                  groupContainerClassName="mb-0"
                >
                  {Object.values(account).map(
                    ({
                      nickname: accountNickname,
                      eid: accountId,
                      selected,
                      currentAddress,
                    }) => (
                      <AccountItem
                        key={accountId}
                        className="h-15 cursor-pointer"
                        accountId={accountId}
                        accountNickname={accountNickname}
                        address={currentAddress?.value}
                        onClickAccount={() => onSelectSingleAccount(accountId)}
                        AccountNameOverlay={
                          <div>
                            <p className="text-xs text-gray-40">
                              {accountNickname}
                            </p>
                            <p className="text-sm text-gray-80">
                              {shortenAddress(
                                formatIntoChecksumAddress(
                                  currentAddress?.value || currentAddress?.hex,
                                ),
                              )}
                            </p>
                          </div>
                        }
                        rightComponent={
                          <div className="flex items-center">
                            {selected && (
                              <img
                                src="/images/location.svg"
                                alt="current address"
                                className="mr-3 w-3 h-3"
                                id="location"
                              />
                            )}
                            <Checkbox
                              checked={checkboxStatusObj[accountId]}
                              id={`check-${index}`}
                              iconClassName="mr-0"
                            />
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
      </CompWithLabel>
    </>
  )
}
ConnectSitesList.propTypes = {
  allAccountGroupData: PropTypes.array.isRequired,
  checkboxStatusObj: PropTypes.object.isRequired,
  onSelectSingleAccount: PropTypes.func.isRequired,
  currentNetworkId: PropTypes.number,
}

function ConnectSite() {
  const {t} = useTranslation()
  const [confirmAccounts, setConfirmAccounts] = useState([])
  const [allAccountGroupData, setAllAccountGroupData] = useState([])
  const [accountData, setAccountData] = useState([])
  const [networkContent, setNetworkContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [networkIcon, setNetworkIcon] = useState('')
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  const [confirmPermissions, setConfirmPermissions] = useState({})
  const pendingAuthReq = usePendingAuthReq()

  const [{req, site = {}}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const permissions = req?.params?.[0] || {}

  const {
    data: {
      network: {
        eid: currentNetworkId,
        icon: currentNetworkIcon,
        name: currentNetworkName,
      },
    },
  } = useCurrentAddress()
  const {data: allAccountGroups} = useAccountList({
    networkId: currentNetworkId,
  })

  useEffect(() => {
    setConfirmPermissions(permissions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(permissions).length])

  useEffect(() => {
    setNetworkIcon(currentNetworkIcon || '')
    setNetworkContent(currentNetworkName || '')
  }, [currentNetworkIcon, currentNetworkName])

  useEffect(() => {
    const allAccountGroupsArr = Object.values(allAccountGroups)
    if (allAccountGroupsArr.length) {
      setAllAccountGroupData(allAccountGroupsArr)
      setAccountData(
        allAccountGroupsArr.reduce((acc, cur) => {
          return {...acc, ...cur.account}
        }, {}),
      )
    }
  }, [allAccountGroups])

  useEffect(() => {
    const accountDataKeys = Object.keys(accountData)
    if (accountDataKeys.length && Object.keys(site).length) {
      const ret = {}
      accountDataKeys.forEach(eid => {
        const app = accountData[eid]?.app
        // already authorized
        const isChosen =
          isArray(app) &&
          app.some(
            ({site: appSite}) => appSite?.eid && appSite.eid === site?.eid,
          )

        ret[eid] = !!(
          checkboxStatusObj?.[eid] ??
          (accountData[eid]?.selected || isChosen)
        )
      })
      setCheckboxStatusObj({...ret})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.keys(checkboxStatusObj).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.keys(site).length,
  ])

  useEffect(() => {
    setConfirmAccounts(
      Object.keys(checkboxStatusObj)
        .filter(id => checkboxStatusObj[id])
        .map(Number),
    )
  }, [checkboxStatusObj])

  const onClickNetworkItem = ({networkName, icon}) => {
    setNetworkContent(networkName)
    setNetworkIcon(icon || '')
    setNetworkShow(false)
  }

  const onSelectSingleAccount = accountId => {
    setCheckboxStatusObj({
      ...checkboxStatusObj,
      [accountId]: !checkboxStatusObj[accountId],
    })
  }

  if (!allAccountGroupData.length) return null

  return (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full w-full justify-between bg-blue-circles bg-no-repeat pb-6"
    >
      <div id="content">
        <DappProgressHeader title={t('connectSite')} />
        <main className="px-3">
          <CompWithLabel
            label={<p className="text-sm text-gray-40">{t('selectNetwork')}</p>}
          >
            <div
              id="setNetworkShow"
              aria-hidden="true"
              onClick={() => setNetworkShow(true)}
              className="cursor-pointer"
            >
              <Input
                value={networkContent}
                width="w-full box-border"
                readOnly
                className="pointer-events-none"
                suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
                id="selectNetwork"
                prefix={
                  <img
                    src={networkIcon || '/images/default-network-icon.svg'}
                    alt="network icon"
                    className="w-4 h-4"
                  />
                }
              />
            </div>
          </CompWithLabel>

          <ConnectSitesList
            currentNetworkId={currentNetworkId}
            allAccountGroupData={allAccountGroupData}
            onSelectSingleAccount={onSelectSingleAccount}
            checkboxStatusObj={checkboxStatusObj}
          />
        </main>
      </div>
      <DappFooter
        cancelText={t('cancel')}
        confirmText={t('connect')}
        confirmDisabled={!confirmAccounts.length}
        confirmParams={{
          accounts: [...confirmAccounts],
          permissions: [confirmPermissions],
        }}
      />
      <Modal
        id="networkModal"
        open={networkShow}
        size="medium"
        title={t('chooseNetwork')}
        onClose={() => setNetworkShow(false)}
        content={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
        className="bg-bg bg-gray-circles bg-no-repeat bg-contain max-h-[552px]"
      />
    </div>
  )
}

export default ConnectSite
