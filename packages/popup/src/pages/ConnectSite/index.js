import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import {useSWRConfig} from 'swr'
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
} from '../../components'
import {useDbAccountListAssets} from '../../hooks/useApi'
import {RPC_METHODS} from '../../constants'
const {WALLETDB_ACCOUNT_LIST_ASSETS} = RPC_METHODS

function ConnectSitesList({
  accountData,
  allCheckboxStatus,
  onSelectAllAccount,
  currentAddress,
  onSelectSingleAccount,
  checkboxStatusObj,
}) {
  const {t} = useTranslation()

  return accountData.length ? (
    <>
      <CompWithLabel
        label={
          <div className="flex justify-between" id="label">
            <div className="flex items-center">
              <div className="text-sm text-gray-40">
                {t('selectAuthorizedAccounts')}
              </div>
              <QuestionCircleOutlined
                onClick={() => window && window.open('')}
                className="w-4 h-4 text-gray-40 ml-2 cursor-pointer"
                id="questionCircleOutlined"
              />
            </div>
            <Checkbox
              checked={allCheckboxStatus}
              onChange={onSelectAllAccount}
              id="selectAll"
            >
              {t('selectAll')}
            </Checkbox>
          </div>
        }
      >
        <div
          id="accountWrapper"
          className="max-h-[282px] rounded border border-solid border-gray-10 pt-2 overflow-auto bg-gray-4 no-scroll"
        >
          {accountData.map(({nickname, account, eid}) => (
            <div key={eid}>
              <p className="text-gray-40 ml-4 mb-1 mt-1 text-xs">{nickname}</p>
              {Object.values(account).map((accountItem, index) => (
                <div
                  aria-hidden="true"
                  onClick={() => onSelectSingleAccount(accountItem.eid)}
                  key={accountItem.eid}
                  id={`item-${index}`}
                  className="flex px-3 items-center h-15 cursor-pointer"
                >
                  <div className="flex w-full">
                    <Avatar
                      className="w-5 h-5 mr-2"
                      diameter={20}
                      accountId={accountItem.eid}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-40">{nickname}</p>
                      <p className="text-sm text-gray-80">
                        {shortenAddress(
                          accountItem.currentAddress?.value ||
                            accountItem.currentAddress?.hex,
                        )}
                      </p>
                    </div>
                    <div className="flex">
                      {currentAddress.eid === accountItem.currentAddress.eid ? (
                        <img
                          src="/images/location.svg"
                          alt="current address"
                          className="mr-3"
                          id="location"
                        />
                      ) : null}
                      <Checkbox
                        checked={checkboxStatusObj[accountItem.eid]}
                        id={`check-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CompWithLabel>
    </>
  ) : null
}
ConnectSitesList.propTypes = {
  accountData: PropTypes.array.isRequired,
  allCheckboxStatus: PropTypes.bool.isRequired,
  checkboxStatusObj: PropTypes.object.isRequired,
  currentAddress: PropTypes.object.isRequired,
  onSelectAllAccount: PropTypes.func.isRequired,
  onSelectSingleAccount: PropTypes.func.isRequired,
}

function ConnectSite() {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const [confirmAccounts, setConfirmAccounts] = useState([])
  const [searchContent, setSearchContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [searchIcon, setSearchIcon] = useState('')
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  const [allCheckboxStatus, setAllCheckboxStatus] = useState(false)

  const {accountGroups, currentNetwork, currentAddress} =
    useDbAccountListAssets()
  const accountData = Object.values(accountGroups || {})

  useEffect(() => {
    setSearchIcon(currentNetwork?.icon || '')
    setSearchContent(currentNetwork?.name || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork?.eid])

  useEffect(() => {
    if (
      accountData.length &&
      !Object.keys(checkboxStatusObj).length &&
      currentAddress?.eid
    ) {
      const ret = {}
      accountData.forEach(({account}) =>
        Object.values(account).forEach(accountItem => {
          ret[accountItem.eid] =
            accountItem.currentAddress.eid === currentAddress.eid
        }),
      )
      setCheckboxStatusObj({...ret})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress?.eid, accountData.length])

  useEffect(() => {
    setAllCheckboxStatus(
      Object.keys(checkboxStatusObj).every(id => checkboxStatusObj[id]),
    )
    setConfirmAccounts(
      Object.keys(checkboxStatusObj)
        .filter(id => checkboxStatusObj[id])
        .map(Number),
    )
  }, [checkboxStatusObj])

  const onClickNetworkItem = ({networkName, icon}) => {
    mutate([WALLETDB_ACCOUNT_LIST_ASSETS])
    setSearchContent(networkName)
    setSearchIcon(icon || '')
    setNetworkShow(false)
  }

  const onSelectAllAccount = () => {
    const ret = {}
    Object.keys(checkboxStatusObj).forEach(k => (ret[k] = !allCheckboxStatus))
    setCheckboxStatusObj({...ret})
    setAllCheckboxStatus(!allCheckboxStatus)
  }

  const onSelectSingleAccount = accountId => {
    setCheckboxStatusObj({
      ...checkboxStatusObj,
      [accountId]: !checkboxStatusObj[accountId],
    })
  }

  return accountGroups && currentNetwork && currentAddress ? (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat pb-4"
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
                value={searchContent}
                width="w-full box-border"
                readonly
                className="pointer-events-none"
                suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
                id="searchContent"
                prefix={
                  <img
                    src={searchIcon || '/images/default-network-icon.svg'}
                    alt="network icon"
                    className="w-4 h-4"
                  />
                }
              />
            </div>
          </CompWithLabel>

          <ConnectSitesList
            accountData={accountData}
            allCheckboxStatus={allCheckboxStatus}
            currentAddress={currentAddress}
            onSelectSingleAccount={onSelectSingleAccount}
            onSelectAllAccount={onSelectAllAccount}
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
