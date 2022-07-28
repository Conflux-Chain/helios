import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import {isArray} from '@fluent-wallet/checks'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Modal from '@fluent-wallet/component-modal'
import useLoading from '../../hooks/useLoading'
import {request} from '../../utils'
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
import {RPC_METHODS, MULTI_ADDRESS_PERMISSIONS} from '../../constants'
import {formatLocalizationLang, formatIntoChecksumAddress} from '../../utils'
import {
  useAccountList,
  useCurrentAddress,
  usePendingAuthReq,
} from '../../hooks/useApi'

const {WALLET_REJECT_PENDING_AUTH_REQUEST} = RPC_METHODS
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
  const [showNext, setShowNext] = useState(false)
  const {setLoading} = useLoading()
  const pendingAuthReq = usePendingAuthReq()

  const [{eid, req, site = {}}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const permissions = req?.params?.[0] || {}

  const {
    data: {
      network: {
        type,
        eid: currentNetworkId,
        icon: currentNetworkIcon,
        name: currentNetworkName,
      },
    },
  } = useCurrentAddress()
  const {data: allAccountGroups} = useAccountList({
    networkId: currentNetworkId,
  })

  const showSecondPermission =
    type &&
    Object.keys(permissions).indexOf(MULTI_ADDRESS_PERMISSIONS[type]) > -1

  const checkedPermission =
    Object.keys(confirmPermissions).indexOf(MULTI_ADDRESS_PERMISSIONS[type]) >
    -1

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

  const onCancel = () => {
    setLoading(true)
    request(WALLET_REJECT_PENDING_AUTH_REQUEST, {authReqId: eid})
      .then(() => {
        setLoading(false)
        window.close()
      })
      .catch(e => {
        Message.error({
          content: e?.message ?? t('unCaughtErrMsg'),
          top: '10px',
          duration: 1,
        })
        setLoading(false)
      })
  }

  const onNext = () => {
    setShowNext(true)
  }

  const onChangePermission = () => {
    if (checkedPermission) {
      const newPermissions = {...confirmPermissions}
      delete newPermissions[MULTI_ADDRESS_PERMISSIONS[type]]
      setConfirmPermissions(newPermissions)
    } else {
      const newPermissions = {
        ...confirmPermissions,
        [MULTI_ADDRESS_PERMISSIONS[type]]: {},
      }
      setConfirmPermissions(newPermissions)
    }
  }

  if (!allAccountGroupData.length) return null

  return (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full w-full justify-between bg-blue-circles bg-no-repeat pb-6"
    >
      <div id="content">
        <DappProgressHeader
          title={!showNext ? t('connectSite') : t('permissionRequest')}
          showNext={showNext}
          setShowNext={setShowNext}
        />
        {showNext ? (
          <main className="px-3 pt-3">
            <span className="mb-4 px-3 text-gray-40 text-sm inline-block">
              {t('allowPermission')}
            </span>
            <div aria-hidden="true" className="flex px-3 items-center w-full">
              <span className="flex-1 flex text-sm text-gray-80 mb-2">
                {t('viewSelectedAddress')}
              </span>
              <Checkbox
                checked={true}
                id="default-current-address"
                iconClassName="mr-0"
                disabled={true}
              />
            </div>
            {showSecondPermission && (
              <div
                id="multi-address"
                aria-hidden="true"
                className="flex px-3 items-center w-full cursor-pointer"
                onClick={onChangePermission}
              >
                <span className="flex-1 flex text-sm text-gray-80">
                  {t('viewMultiAddress')}
                </span>
                <Checkbox checked={checkedPermission} iconClassName="mr-0" />
              </div>
            )}
          </main>
        ) : (
          <main className="px-3">
            <CompWithLabel
              label={
                <p className="text-sm text-gray-40">{t('selectNetwork')}</p>
              }
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
            <Modal
              id="networkModal"
              open={networkShow}
              size="medium"
              title={t('chooseNetwork')}
              onClose={() => setNetworkShow(false)}
              content={
                <NetworkContent onClickNetworkItem={onClickNetworkItem} />
              }
              className="bg-bg bg-gray-circles bg-no-repeat bg-contain max-h-[552px]"
            />
          </main>
        )}
      </div>
      {!showNext ? (
        <footer className="dapp-footer-container flex w-full px-4">
          <Button
            id="cancelBtn"
            className="flex-1"
            variant="outlined"
            onClick={onCancel}
          >
            {t('cancel')}
          </Button>
          <div className="w-3" />
          <Button
            id="nextBtn"
            className="flex-1"
            onClick={onNext}
            disabled={!confirmAccounts.length}
          >
            {t('next')}
          </Button>
        </footer>
      ) : (
        <DappFooter
          cancelText={t('cancel')}
          confirmText={t('connect')}
          confirmDisabled={!confirmAccounts.length}
          confirmParams={{
            accounts: [...confirmAccounts],
            permissions: [confirmPermissions],
          }}
        />
      )}
    </div>
  )
}

export default ConnectSite
