import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
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
  DappTransactionFooter,
} from '../../components'
import {useAccountGroupAddress} from '../../hooks'
import {formatIntoShortAddress} from '../../utils'
const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

function ConnectSitesList({networkId}) {
  const {t} = useTranslation()
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  const [allCheckboxStatus, setAllCheckboxStatus] = useState(false)
  const {addressData, accountData} = useAccountGroupAddress(networkId)

  const {data: currentAccount} = useRPC([GET_CURRENT_ACCOUNT], undefined, {
    fallbackData: {},
  })

  const onSelectSingleAccount = accountId => {
    setCheckboxStatusObj({
      ...checkboxStatusObj,
      [accountId]: !checkboxStatusObj[accountId],
    })
  }

  useDeepCompareEffect(() => {
    if (addressData) {
      const ret = {}
      Object.keys(addressData).forEach(k => (ret[k] = false))
      setCheckboxStatusObj({...ret})
      setAllCheckboxStatus(false)
    }
  }, [addressData || {}])

  useDeepCompareEffect(() => {
    if (addressData) {
      const ret = {}
      Object.keys(addressData).forEach(k => (ret[k] = allCheckboxStatus))
      setCheckboxStatusObj({...ret})
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData || {}, allCheckboxStatus])

  return accountData.length ? (
    <>
      <div className="flex justify-between px-1 mt-3 mb-2">
        <div className="flex items-center">
          <div className="text-sm text-gray-40">
            {t('selectAuthorizedAccounts')}
          </div>
          <QuestionCircleOutlined
            onClick={() => window && window.open('')}
            className="w-4 h-4 text-gray-40 ml-2"
          />
        </div>
        <Checkbox
          checked={allCheckboxStatus}
          onChange={() => setAllCheckboxStatus(!allCheckboxStatus)}
        >
          {t('selectAll')}
        </Checkbox>
      </div>
      <div className="h-[282px] rounded border border-solid border-gray-10 pt-2 overflow-auto no-scroll">
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
                      {formatIntoShortAddress(address)}
                    </p>
                  </div>
                  <div className="flex">
                    {currentAccount.eid && currentAccount.eid === eid ? (
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
    </>
  ) : null
}
ConnectSitesList.propTypes = {
  networkId: PropTypes.number,
}

function ConnectSite() {
  const [searchContent, setSearchContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [networkId, setNetworkId] = useState(null)
  const [searchIcon, setSearchIcon] = useState('')
  const {t} = useTranslation()
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])

  const onClickNetworkItem = ({networkId, networkName, icon}) => {
    setNetworkId(networkId)
    setSearchContent(networkName)
    setSearchIcon(icon || '')
    setNetworkShow(false)
  }

  useEffect(() => {
    setSearchIcon(currentNetworkData?.icon || '')
    setSearchContent(currentNetworkData?.name || '')
    setNetworkId(currentNetworkData?.eid || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(currentNetworkData)])

  return currentNetworkData ? (
    <div
      id="connectSiteContainer"
      className="flex flex-col h-full justify-between bg-blue-circles bg-no-repeat"
    >
      <div>
        <header>
          <div>
            <p className="text-sm text-gray-100 text-center h-13 flex justify-center items-center mb-1">
              {t('connectSite')}
            </p>
            <DappConnectWalletHeader />
            <p className="text-base text-gray-80 text-center mt-2 font-medium">
              dapp name
            </p>
          </div>
        </header>
        <main className="px-3">
          <p className="text-sm text-gray-40 mt-3 mb-2 ml-1">
            {t('selectNetwork')}
          </p>
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
          <ConnectSitesList networkId={networkId} />
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
      <DappTransactionFooter
        cancelText={t('cancel')}
        confirmText={t('connect')}
      />
    </div>
  ) : null
}

export default ConnectSite
