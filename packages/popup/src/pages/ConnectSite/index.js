import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import Checkbox from '@fluent-wallet/component-checkbox'
import {useRPC} from '@fluent-wallet/use-rpc'
import {
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import {RPC_METHODS} from '../../constants'
import {NetworkContent} from '../../components'
import {useAccountGroupAddress} from '../../hooks'
const {GET_CURRENT_NETWORK, GET_CURRENT_ACCOUNT} = RPC_METHODS

const formatAddress = address => {
  if (typeof address !== 'string' || address.length <= 11) {
    return address
  }
  return `${address.substr(0, 7)}...${address.substring(address.length - 4)}`
}
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
                      {formatAddress(address)}
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
    <div className="flex flex-col h-full justify-between">
      <div>
        <header>
          <img
            src="images/blue-circles-bg.svg"
            alt="dapp-bg"
            className="absolute top-0 z-0 h-32 w-full left-0"
          />
          <div className="z-10 relative">
            <p className="text-sm text-gray-100 text-center h-13 flex justify-center items-center">
              {t('connectSite')}
            </p>
            <div className="flex justify-center items-center mt-1">
              <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
                <img src="" alt="favicon" className="w-8 h-8" />
              </div>
              <div className="w-2 h-2 border-solid border-primary border-2 rounded-full ml-2" />
              <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
              <img
                src="images/paperclip.svg"
                alt="connecting"
                className="w-4 h-4"
              />
              <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
              <div className="w-2 h-2 border-solid border-primary border-2 rounded-full mr-2" />
              <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
                <img className="w-8 h-8" src="images/logo.svg" alt="logo" />
              </div>
            </div>
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
            aria-hidden
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
            open={networkShow}
            size="medium"
            title={t('chooseNetwork')}
            onClose={() => setNetworkShow(false)}
            content={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
            className="bg-bg bg-gray-circles bg-no-repeat bg-contain"
          />
        </main>
      </div>

      <footer className="flex px-4">
        <Button className="flex-1" variant="outlined" key="cancel">
          {t('cancel')}
        </Button>
        <div className="w-3" />
        <Button className="flex-1">{t('connect')}</Button>
      </footer>
    </div>
  ) : null
}

export default ConnectSite
