import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {isUndefined} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import Loading from '@fluent-wallet/component-loading'
import {CFX_DECIMALS} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Checkbox from '@fluent-wallet/component-checkbox'
import Button from '@fluent-wallet/component-button'
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
} from '@fluent-wallet/component-icons'
import {
  DEFAULT_CFX_HDPATH,
  CFX_MAINNET_NETID,
  CFX_TESTNET_NETID,
  CFX_TESTNET_CHAINID,
  CFX_MAINNET_CHAINID,
} from '@fluent-wallet/consts'
import {toAccountAddress} from '@fluent-wallet/account'
import {encode} from '@fluent-wallet/base32-address'
import {TitleNav, CompWithLabel, Avatar, DisplayBalance} from '../../components'
import {useCurrentAddress, useBalance} from '../../hooks/useApi'

const mockAddress = [
  '0xb2f4dea18a2ce5b67015d5cb0c87b94f6483dcc1',
  '0x186e277bf6f088deb86a549f49e3c014bc3d72c8',
  '0x83a930f2b03ec188ddb6a68c0037eaf88fb21282',
]

function ImportingResults({importStatus}) {
  const {t} = useTranslation()

  return (
    <div
      id="importing-results"
      className="m-auto light flex flex-col h-full min-h-screen"
    >
      <div className="flex-2" />
      <div className="flex flex-col items-center">
        <div className="bg-add-hw-account w-120 h-45 relative">
          {importStatus === 'loading' ? (
            <Loading className="absolute right-[110px] top-[54px] w-7 h-7" />
          ) : (
            <CheckCircleFilled className="absolute right-[110px] top-[54px] w-7 h-7 text-success" />
          )}
        </div>
        <div className="w-100 text-center mt-4">
          <p className="text-lg font-medium text-gray-80 mb-2">
            {importStatus === 'loading' ? t('adding') : t('accountAdded')}
          </p>
          <p className="text-gray-60 text-sm">
            {importStatus === 'loading'
              ? t('keepHwConnected')
              : t('importedHwAccount')}
          </p>
        </div>
      </div>
      {importStatus === 'success' ? (
        <Button className="w-70 mx-auto mt-9" size="large">
          {t('done')}
        </Button>
      ) : null}

      <div className="flex-3" />
    </div>
  )
}
ImportingResults.propTypes = {
  importStatus: PropTypes.string.isRequired,
}

function ImportHwAccount() {
  const {t} = useTranslation()
  const {
    data: {
      network: {eid: networkId, chainId},
    },
  } = useCurrentAddress()
  const [allCheckboxStatus, setAllCheckboxStatus] = useState(false)
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  //  "" loading  success
  const [importStatus, setImportStatus] = useState('')

  // TODO: 上一页下一页的时候需要重置。同时过滤已导入的地址
  useEffect(() => {
    if (mockAddress.length && !Object.keys(checkboxStatusObj).length) {
      const ret = {}
      mockAddress.forEach(address => {
        ret[address] = false
      })
      setCheckboxStatusObj({...ret})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockAddress])

  useEffect(() => {
    setAllCheckboxStatus(
      Object.keys(checkboxStatusObj).every(id => checkboxStatusObj[id]),
    )
  }, [checkboxStatusObj])

  const onSelectAllAccount = () => {
    const ret = {}
    Object.keys(checkboxStatusObj).forEach(k => (ret[k] = !allCheckboxStatus))
    setCheckboxStatusObj({...ret})
    setAllCheckboxStatus(!allCheckboxStatus)
  }

  const onSelectSingleAccount = address => {
    setCheckboxStatusObj({
      ...checkboxStatusObj,
      [address]: !checkboxStatusObj[address],
    })
  }
  let base32Address = null

  if (!isUndefined(chainId)) {
    // TODO： should add eth net id when add multiple chain
    let netId =
      chainId === CFX_TESTNET_CHAINID
        ? CFX_TESTNET_NETID
        : chainId === CFX_MAINNET_CHAINID
        ? CFX_MAINNET_NETID
        : null
    if (netId) {
      base32Address = mockAddress.map(addr =>
        encode(toAccountAddress(addr), netId),
      )
    }
  }

  const balances = useBalance(base32Address, networkId)

  if (importStatus) {
    return <ImportingResults importStatus={importStatus} />
  }

  return base32Address && Object.keys(balances).length ? (
    <div
      id="import-hw-account"
      className="m-auto light flex flex-col h-full min-h-screen"
    >
      <div className="w-120 rounded-2xl shadow-fluent-3 px-8 pb-6">
        <TitleNav
          title={t('chooseAddress')}
          hasGoBack={false}
          className="text-lg text-gray-80 font-medium"
        />
        <CompWithLabel
          className="mt-5"
          label={<p className="text-sm text-gray-40">{t('hdPath')}</p>}
        >
          <Input
            value={`BIP 44 Standard(${DEFAULT_CFX_HDPATH})`}
            width="w-full box-border"
            readOnly
            className="pointer-events-none"
            id="hd-path"
          />
        </CompWithLabel>
        <CompWithLabel
          label={
            <div className="flex justify-between" id="label">
              <div className="flex items-center">
                <div className="text-sm text-gray-40">
                  {t('chooseHwAddress')}
                </div>
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
            className="rounded border border-solid border-gray-10 pt-3 overflow-auto bg-gray-4 no-scroll"
          >
            {mockAddress.map((hexAddress, index) => (
              <div
                aria-hidden="true"
                onClick={() => onSelectSingleAccount(hexAddress)}
                key={hexAddress}
                id={`item-${index}`}
                className="flex px-3 items-center h-15 cursor-pointer"
              >
                <div className="flex w-full">
                  <Avatar
                    className="w-5 h-5 mr-2"
                    diameter={20}
                    accountIdentity={hexAddress}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-40">
                      {shortenAddress(base32Address[index])}
                    </p>
                    <DisplayBalance
                      balance={balances[base32Address[index]]['0x0']}
                      maxWidth={264}
                      maxWidthStyle="max-w-[264px]"
                      className="!text-gray-80 !font-normal"
                      decimals={CFX_DECIMALS}
                      symbol="CFX"
                      id="hwAddressCfxBalance"
                    />
                  </div>
                  <div className="flex">
                    <Checkbox
                      checked={checkboxStatusObj[hexAddress]}
                      id={`check-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center items-center my-3">
              <Button
                className="mr-20 w-25"
                onClick={() => {}}
                variant="text"
                id="prev-btn"
                startIcon={<LeftOutlined className="!text-gray-80" />}
              >
                {t('capPrev')}
              </Button>
              <Button
                className="w-25"
                onClick={() => {}}
                variant="text"
                endIcon={<RightOutlined className="!text-gray-80" />}
                id="next-btn"
              >
                {t('capNext')}
              </Button>
            </div>
          </div>
        </CompWithLabel>
        <Button size="large" className="w-70 mx-auto mt-6">
          {t('next')}
        </Button>
      </div>
    </div>
  ) : null
}
export default ImportHwAccount
