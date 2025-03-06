import PropTypes from 'prop-types'
import {useState, useEffect, useMemo, useCallback} from 'react'
import {useAsync} from 'react-use'
import {useSWRConfig} from 'swr'
import {isUndefined} from '@fluent-wallet/checks'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import Loading from '@fluent-wallet/component-loading'
import {COMMON_DECIMALS} from '@fluent-wallet/data-format'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Checkbox from '@fluent-wallet/component-checkbox'
import Button from '@fluent-wallet/component-button'
import Message from '@fluent-wallet/component-message'
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import {
  DEFAULT_CFX_HDPATH,
  DEFAULT_ETH_HDPATH,
  LEDGER_LIVE_PATH,
  MEW_PATH,
} from '@fluent-wallet/consts'
import {encode} from '@fluent-wallet/base32-address'
import {TitleNav, CompWithLabel, Avatar, DisplayBalance} from '../../components'
import {
  RPC_METHODS,
  HARDWARE_ACCOUNT_PAGE_LIMIT,
  NETWORK_TYPE,
} from '../../constants'
import {
  useCurrentAddress,
  useBalance,
  useQueryImportedAddress,
} from '../../hooks/useApi'
import {useLedgerBindingApi} from '../../hooks'
import useLoading from '../../hooks/useLoading'
import useImportHWParams from './useImportHWParams'
import {request} from '../../utils'
import Dropdown from '@fluent-wallet/component-dropdown'
import Menu from '../../../../ui/components/Menu'
import MenuItem from '../../../../ui/components/Menu/MenuItem'

const {
  WALLET_IMPORT_HARDWARE_WALLET_ACCOUNT_GROUP_OR_ACCOUNT,
  WALLETDB_REFETCH_BALANCE,
} = RPC_METHODS

const confluxLedgerPath = {
  name: 'BIP 44 Standard',
  value: DEFAULT_CFX_HDPATH,
}

const ethereumLedgerPath = [
  {
    name: 'BIP 44 Standard',
    value: DEFAULT_ETH_HDPATH,
  },
  {
    name: 'Ledger Live',
    value: LEDGER_LIVE_PATH,
  },
  {
    name: 'Legacy',
    value: MEW_PATH,
  },
]

function ImportingResults({importStatus}) {
  const {t} = useTranslation()
  const {mutate} = useSWRConfig()
  const {mutate: mutateCurrentAddress} = useCurrentAddress()

  const onClickDone = () => {
    mutate([WALLETDB_REFETCH_BALANCE])
    mutateCurrentAddress()
    window.open(' ', '_self')
    window.close()
  }
  return (
    <div
      id="importing-results"
      className="m-auto light flex flex-col h-full w-full overflow-auto"
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
        <Button
          className="w-70 mx-auto mt-9"
          size="large"
          onClick={onClickDone}
        >
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
  const [allCheckboxStatus, setAllCheckboxStatus] = useState(false)
  const [checkboxStatusObj, setCheckboxStatusObj] = useState({})
  const [offset, setOffset] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const {setLoading} = useLoading()
  const {
    data: {
      network: {
        eid: networkId,
        netId,
        type,
        ticker: {symbol},
      },
    },
  } = useCurrentAddress()
  const {data: importedAddressData} = useQueryImportedAddress(networkId)
  const ledgerBindingApi = useLedgerBindingApi()

  const [selectedPath, setSelectedPath] = useState()

  const {value: addressList, loading} = useAsync(async () => {
    let addresses = []
    if (selectedPath === undefined) return addresses
    try {
      if (ledgerBindingApi) {
        addresses = await ledgerBindingApi.getAddressList(
          new Array(HARDWARE_ACCOUNT_PAGE_LIMIT)
            .fill('')
            .map((_item, index) => index + offset),
          selectedPath?.value,
        )
      }
    } catch (e) {
      Message.error({
        content:
          e?.appCode == 5031
            ? t('refreshLater')
            : e?.message ?? t('unCaughtErrMsg'),
        duration: 1,
      })
    }
    return addresses?.length
      ? addresses.map(({address, hdPath}) => {
          return {address: address?.toLowerCase?.(), hdPath}
        })
      : addresses
  }, [selectedPath, offset, ledgerBindingApi])

  const handleSelectChange = useCallback(path => {
    // if user change the hd path, reset the offset
    setSelectedPath(path)
    setOffset(0)
  }, [])

  const {value: deviceInfo} = useAsync(async () => {
    if (ledgerBindingApi) {
      const info = await ledgerBindingApi.getDeviceInfo()
      return info
    }
  }, [ledgerBindingApi])

  const {params: hwParams, nextAccountIndex} = useImportHWParams(
    deviceInfo?.name,
  )

  const displayAddresses = useMemo(() => {
    if (isUndefined(netId) || isUndefined(addressList)) {
      return []
    }
    return addressList.map(({address}) =>
      type === NETWORK_TYPE.CFX ? encode(address, netId) : address,
    )
  }, [addressList, netId, type])

  useEffect(() => {
    if (ledgerBindingApi) {
      setLoading(loading)
    }
  }, [loading, setLoading, ledgerBindingApi])

  useEffect(() => {
    if (addressList?.length) {
      const ret = {}
      addressList.forEach(({address}) => {
        ret[address] = !!importedAddressData?.[address] ?? false
      })
      setCheckboxStatusObj({...ret})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressList])

  useEffect(() => {
    setAllCheckboxStatus(
      Object.keys(checkboxStatusObj).every(id => checkboxStatusObj[id]),
    )
  }, [checkboxStatusObj])

  useEffect(() => {
    if (selectedPath === undefined) {
      if (type === NETWORK_TYPE.CFX) {
        setSelectedPath(confluxLedgerPath)
      } else if (type === NETWORK_TYPE.ETH) {
        setSelectedPath(ethereumLedgerPath[0])
      }
    }
  }, [type, selectedPath])

  const onSelectAllAccount = () => {
    const ret = {}
    Object.keys(checkboxStatusObj).forEach(
      k =>
        (ret[k] = importedAddressData?.[k]
          ? !!importedAddressData?.[k]
          : !allCheckboxStatus),
    )
    setCheckboxStatusObj({...ret})
    setAllCheckboxStatus(!allCheckboxStatus)
  }

  const onSelectSingleAccount = address => {
    if (importedAddressData?.[address]) {
      return
    }
    setCheckboxStatusObj({
      ...checkboxStatusObj,
      [address]: !checkboxStatusObj[address],
    })
  }
  const onPageUp = () => {
    if (!loading) {
      setOffset(offset - HARDWARE_ACCOUNT_PAGE_LIMIT)
    }
  }

  const onPageDown = () => {
    if (!loading) {
      setOffset(offset + HARDWARE_ACCOUNT_PAGE_LIMIT)
    }
  }
  const balances = useBalance(
    displayAddresses?.length ? displayAddresses : null,
    networkId,
  )
  const onImportAccount = () => {
    let chosenBase32Address = []
    let accountGroupData = {}
    addressList.forEach(({address, hdPath}, index) => {
      if (checkboxStatusObj?.[address] && !importedAddressData?.[address]) {
        accountGroupData[address] = hdPath
        chosenBase32Address.push({
          address: displayAddresses[index],
          nickname: `${deviceInfo.name}-${
            nextAccountIndex + chosenBase32Address.length
          }`,
        })
      }
    })

    if ('accountGroupData' in hwParams) {
      accountGroupData = {...accountGroupData, ...hwParams.accountGroupData}
    }
    let params = {
      ...hwParams,
      accountGroupData,
      address: chosenBase32Address,
    }
    setImportStatus('loading')
    request(WALLET_IMPORT_HARDWARE_WALLET_ACCOUNT_GROUP_OR_ACCOUNT, params)
      .then(() => {
        setImportStatus('success')
      })
      .catch(e => {
        setImportStatus('')
        Message.error({
          content: e?.message ?? t('unCaughtErrMsg'),
          duration: 1,
        })
      })
  }

  if (!deviceInfo?.name || isUndefined(networkId) || !ledgerBindingApi) {
    return null
  }
  if (importStatus) {
    return <ImportingResults importStatus={importStatus} />
  }
  return (
    <div
      id="import-hw-account"
      className="flex flex-col h-full w-full overflow-auto no-scroll w-screen"
    >
      <div className="flex-2" />
      <div className="w-120 rounded-2xl shadow-fluent-3 px-8 pb-6 m-auto">
        <TitleNav
          title={t('chooseAddress')}
          hasGoBack={false}
          className="text-lg text-gray-80 font-medium"
        />
        <CompWithLabel
          className="mt-5"
          label={<p className="text-sm text-gray-40">{t('hdPath')}</p>}
        >
          {type === NETWORK_TYPE.CFX ? (
            <Input
              value={`${confluxLedgerPath?.name}(${confluxLedgerPath?.value})`}
              width="w-full box-border"
              readOnly
              className="pointer-events-none"
              id="hd-path"
            />
          ) : (
            <Dropdown
              overlay={
                <Menu>
                  {ethereumLedgerPath.map(({name, value}) => (
                    <MenuItem
                      onClick={() => handleSelectChange({name, value})}
                      selected={selectedPath?.value === value}
                      containerClassName="w-full"
                      key={value}
                      itemKey={value}
                    >{`${name}(${value})`}</MenuItem>
                  ))}
                </Menu>
              }
            >
              <Input
                value={`${selectedPath?.name}(${selectedPath?.value})`}
                width="w-full box-border"
                readOnly
                id="hd-path"
              />
            </Dropdown>
          )}
        </CompWithLabel>
        <CompWithLabel
          label={
            <div className="flex justify-between" id="label">
              <div className="flex items-center">
                <div className="text-sm text-gray-40">
                  {t('chooseHwAddress')}
                </div>
                <QuestionCircleOutlined
                  onClick={() =>
                    window &&
                    window.open(
                      'https://fluent-wallet.zendesk.com/hc/en-001/articles/4414140249115-What-is-HD-wallet',
                    )
                  }
                  className="w-4 h-4 text-gray-40 ml-2 cursor-pointer"
                  id="open-what-is-hd-wallet"
                />
              </div>
              {addressList?.length && importedAddressData ? (
                <Checkbox
                  checked={allCheckboxStatus}
                  onChange={onSelectAllAccount}
                  disabled={addressList.every(
                    ({address}) => importedAddressData?.[address],
                  )}
                  id="selectAll"
                >
                  {t('selectAll')}
                </Checkbox>
              ) : null}
            </div>
          }
        >
          {addressList?.length && importedAddressData ? (
            <div
              id="accountWrapper"
              className="rounded border border-solid border-gray-10 pt-3 overflow-auto bg-gray-4 no-scroll"
            >
              {addressList.map(({address: hexAddress}, index) => (
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
                      address={hexAddress}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-40">
                        {displayAddresses?.[index]
                          ? shortenAddress(displayAddresses[index])
                          : ''}
                      </p>
                      <DisplayBalance
                        balance={
                          balances?.[displayAddresses?.[index]]?.['0x0'] || '0'
                        }
                        maxWidth={264}
                        maxWidthStyle="max-w-[264px]"
                        className="!text-gray-80 !font-normal"
                        decimals={COMMON_DECIMALS}
                        symbol={symbol || ''}
                        id="hwAddressCfxBalance"
                      />
                    </div>
                    <div className="flex">
                      <Checkbox
                        checked={checkboxStatusObj[hexAddress]}
                        disabled={!!importedAddressData?.[hexAddress]}
                        id={`check-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center items-center my-3 h-10">
                <Button
                  className="mr-20 w-25"
                  disabled={offset <= 0}
                  onClick={onPageUp}
                  variant="text"
                  id="prev-btn"
                  startIcon={<LeftOutlined className="!text-gray-80" />}
                >
                  {t('capPrev')}
                </Button>
                <Button
                  className="w-25"
                  disabled={offset >= 200}
                  onClick={onPageDown}
                  variant="text"
                  endIcon={<RightOutlined className="!text-gray-80" />}
                  id="next-btn"
                >
                  {t('capNext')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded border border-solid border-gray-10 pt-3 overflow-auto bg-gray-4 no-scroll h-[376px]"></div>
          )}
        </CompWithLabel>
        <Button
          size="large"
          className="w-70 mx-auto mt-6"
          onClick={onImportAccount}
          disabled={
            !displayAddresses?.length ||
            loading ||
            !Object.keys(hwParams).length ||
            Object.keys(checkboxStatusObj).filter(
              addr => checkboxStatusObj[addr] && !importedAddressData[addr],
            ).length === 0
          }
        >
          {t('import')}
        </Button>
      </div>
      <div className="flex-3" />
    </div>
  )
}
export default ImportHwAccount
