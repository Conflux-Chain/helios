import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState} from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import {useRPC} from '@fluent-wallet/use-rpc'
import {
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import {RPC_METHODS} from '../../constants'
import {
  NetworkContent,
  DappConnectWalletHeader,
  DappFooter,
  CompWithLabel,
} from '../../components'
import {useAccountGroupAddress} from '../../hooks'
import {shortenAddress} from '@fluent-wallet/shorten-address'
const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

function ConnectSitesList({
  accountData,
  allCheckboxStatus,
  onSelectAllAccount,
  currentAccount,
  onSelectSingleAccount,
  checkboxStatusObj,
}) {
  const {t} = useTranslation()

  return accountData?.length ? (
    <>
      <CompWithLabel
        label={
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="text-sm text-gray-40">
                {t('selectAuthorizedAccounts')}
              </div>
              <QuestionCircleOutlined
                onClick={() => window && window.open('')}
                className="w-4 h-4 text-gray-40 ml-2 cursor-pointer"
              />
            </div>
            <Checkbox checked={allCheckboxStatus} onChange={onSelectAllAccount}>
              {t('selectAll')}
            </Checkbox>
          </div>
        }
      >
        <div className="max-h-[282px] rounded border border-solid border-gray-10 pt-2 overflow-auto bg-gray-4 no-scroll">
          {accountData.map(({nickname, account}, groupIndex) => (
            <div key={groupIndex}>
              <p className="text-gray-40 ml-4 mb-1 mt-1 text-xs">{nickname}</p>
              {account.map(({nickname, eid, address}, accountIndex) => (
                <div
                  aria-hidden="true"
                  onClick={() => () => {}}
                  key={accountIndex}
                  className="flex px-3 items-center h-15"
                >
                  <div className="flex w-full">
                    <img className="w-5 h-5 mr-2" src="" alt="avatar" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-40">{nickname}</p>
                      <p className="text-sm text-gray-80">
                        {address ? shortenAddress(address) : ''}
                      </p>
                    </div>
                    <div className="flex">
                      {currentAccount?.eid === eid ? (
                        <img
                          src="images/location.svg"
                          alt="current address"
                          className="mr-3"
                        />
                      ) : null}
                      <Checkbox
                        onChange={() => onSelectSingleAccount(eid)}
                        checked={checkboxStatusObj[eid]}
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
  currentAccount: PropTypes.object.isRequired,
  onSelectAllAccount: PropTypes.func.isRequired,
  onSelectSingleAccount: PropTypes.func.isRequired,
}

function ConnectSite() {
  const {t} = useTranslation()
  const [confirmAccounts, setConfirmAccounts] = useState([])
  const [searchContent, setSearchContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [networkId, setNetworkId] = useState(null)
  const [searchIcon, setSearchIcon] = useState('')
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  const [allCheckboxStatus, setAllCheckboxStatus] = useState(false)

  const {addressDataWithAccountId, accountData} =
    useAccountGroupAddress(networkId)
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])
  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })

  useDeepCompareEffect(() => {
    setSearchIcon(currentNetworkData?.icon || '')
    setSearchContent(currentNetworkData?.name || '')
    setNetworkId(currentNetworkData?.eid || null)
  }, [currentNetworkData || {}])

  useDeepCompareEffect(() => {
    if (
      addressDataWithAccountId &&
      !Object.keys(checkboxStatusObj).length &&
      currentAccount.eid
    ) {
      const ret = {}
      Object.keys(addressDataWithAccountId).forEach(
        id => (ret[id] = Number(id) === currentAccount.eid),
      )
      setCheckboxStatusObj({...ret})
    }
  }, [addressDataWithAccountId || {}, currentAccount])

  useDeepCompareEffect(() => {
    setAllCheckboxStatus(
      Object.keys(checkboxStatusObj).every(id => checkboxStatusObj[id]),
    )
    setConfirmAccounts(
      Object.keys(checkboxStatusObj)
        .filter(id => checkboxStatusObj[id])
        .map(Number),
    )
  }, [checkboxStatusObj])

  const onClickNetworkItem = (result, {networkId, networkName, icon}) => {
    setNetworkId(networkId)
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

  return currentNetworkData ? (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat pb-4"
    >
      <div>
        <DappConnectWalletHeader title={t('connectSite')} />
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
                readOnly={true}
                className="pointer-events-none"
                suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
                prefix={
                  <img
                    src={searchIcon || 'images/default-network-icon.svg'}
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
            currentAccount={currentAccount}
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
