import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
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
  Avatar,
  NoResult,
  StretchInput,
  WrapIcon,
} from '../../components'
import {formatLocalizationLang} from '../../utils'
import {useDbAccountListAssets, useCurrentAddress} from '../../hooks/useApi'

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
          className="max-h-[272px] rounded border border-solid border-gray-10 pt-2 overflow-auto bg-gray-4 no-scroll"
        >
          {searchedAccountGroup && accountGroupData.length === 0 ? (
            <NoResult content={t('noResult')} containerClassName="h-[262px]" />
          ) : (
            accountGroupData.map(({nickname, account, vault, eid}) => (
              <div key={eid}>
                {vault?.type === 'pk' ? null : (
                  <div className="flex items-center ml-3 mt-0.5">
                    <WrapIcon
                      size="w-5 h-5 mr-1 bg-primary-4"
                      clickable={false}
                    >
                      <img src="/images/seed-group-icon.svg" alt="group-icon" />
                    </WrapIcon>
                    <p className="text-gray-40 text-xs">{nickname}</p>
                  </div>
                )}
                {Object.values(account)
                  .filter(({hidden}) => !hidden)
                  .map(
                    (
                      {eid: accountId, nickname, currentAddress, selected},
                      index,
                    ) => (
                      <div
                        aria-hidden="true"
                        onClick={() => onSelectSingleAccount(accountId)}
                        key={accountId}
                        id={`item-${index}`}
                        className="flex px-3 items-center h-15 cursor-pointer"
                      >
                        <div className="flex w-full">
                          <Avatar
                            className="w-5 h-5 mr-2"
                            diameter={20}
                            accountIdentity={accountId}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-40">{nickname}</p>
                            <p className="text-sm text-gray-80">
                              {shortenAddress(
                                currentAddress?.value || currentAddress?.hex,
                              )}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {selected ? (
                              <img
                                src="/images/location.svg"
                                alt="current address"
                                className="mr-3 w-3 h-3"
                                id="location"
                              />
                            ) : null}
                            <Checkbox
                              checked={checkboxStatusObj[accountId]}
                              id={`check-${index}`}
                              iconClassName="mr-0"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            ))
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
  const [networkContent, setNetworkContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [networkIcon, setNetworkIcon] = useState('')
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})

  const {
    data: {
      network: {
        eid: currentNetworkId,
        icon: currentNetworkIcon,
        name: currentNetworkName,
      },
    },
  } = useCurrentAddress()
  const {data: allAccountGroups} = useDbAccountListAssets(currentNetworkId)

  const allAccountGroupData = Object.values(allAccountGroups)
  const accountData = allAccountGroupData.reduce((acc, cur) => {
    return {...acc, ...cur.account}
  }, {})

  useEffect(() => {
    setNetworkIcon(currentNetworkIcon || '')
    setNetworkContent(currentNetworkName || '')
  }, [currentNetworkIcon, currentNetworkName])

  useEffect(() => {
    const accountDataKeys = Object.keys(accountData)
    if (
      accountDataKeys.length &&
      accountDataKeys.length !== Object.keys(checkboxStatusObj).length
    ) {
      const ret = {}
      accountDataKeys.forEach(eid => {
        ret[eid] = checkboxStatusObj?.[eid] ?? !!accountData[eid]?.selected
      })
      setCheckboxStatusObj({...ret})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(accountData).length, Object.keys(checkboxStatusObj).length])

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

  return Object.values(allAccountGroups).length ? (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full w-full justify-between bg-blue-circles bg-no-repeat pb-4"
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
          <Modal
            id="networkModal"
            open={networkShow}
            size="medium"
            title={t('chooseNetwork')}
            onClose={() => setNetworkShow(false)}
            content={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
            className="bg-bg bg-gray-circles bg-no-repeat bg-contain"
          />
        </main>
      </div>
      <DappFooter
        cancelText={t('cancel')}
        confirmText={t('connect')}
        confirmDisabled={!confirmAccounts.length}
        confirmParams={{
          accounts: [...confirmAccounts],
        }}
      />
    </div>
  ) : null
}

export default ConnectSite
