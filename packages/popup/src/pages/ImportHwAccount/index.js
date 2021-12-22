import PropTypes from 'prop-types'
import {useState, useEffect, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {useAsync} from 'react-use'
import {useSWRConfig} from 'swr'
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
import {DEFAULT_CFX_HDPATH} from '@fluent-wallet/consts'
import Toast from '@fluent-wallet/component-toast'
import {encode} from '@fluent-wallet/base32-address'
import {Conflux} from '@fluent-wallet/ledger'
import {TitleNav, CompWithLabel, Avatar, DisplayBalance} from '../../components'
import {RPC_METHODS, ROUTES, HARDWARE_ACCOUNT_PAGE_LIMIT} from '../../constants'
import {
  useCurrentAddress,
  useBalance,
  useQueryImportedAddress,
} from '../../hooks/useApi'
import useImportHWParams from './useImportHWParams'
import {request} from '../../utils'

const {HOME} = ROUTES
const {
  WALLET_IMPORT_HARDWARE_WALLET_ACCOUNT_GROUP_OR_ACCOUNT,
  WALLETDB_REFETCH_BALANCE,
  WALLETDB_ACCOUNT_LIST_ASSETS,
} = RPC_METHODS
const cfx = new Conflux()

function ImportingResults({importStatus}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const onClickDone = () => {
    mutate([WALLETDB_REFETCH_BALANCE])
    mutate([WALLETDB_ACCOUNT_LIST_ASSETS, 'all'])
    history.push(HOME)
  }
  return (
    <div
      id="importing-results"
      className="m-auto light flex flex-col h-full w-full"
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
  const [errMsg, setErrMsg] = useState('')
  const [importStatus, setImportStatus] = useState('')
  const {
    data: {
      network: {eid: networkId, netId},
    },
  } = useCurrentAddress()
  const {data: importedAddressData} = useQueryImportedAddress(networkId)
  const {value: addressList, loading} = useAsync(async () => {
    let addresses = []
    try {
      addresses = await cfx.getAddressList(
        new Array(HARDWARE_ACCOUNT_PAGE_LIMIT)
          .fill('')
          .map((_item, index) => index + offset),
      )
    } catch (e) {
      // TODO: error message
      setErrMsg(
        e?.appCode == 5031 ? t('refreshLater') : 'some thing goes wrong',
      )
    }
    return addresses
  }, [offset])

  const {value: deviceInfo} = useAsync(async () => {
    const info = await cfx.getDeviceInfo()
    return info
  }, [])

  const {params: hwParams, nextAccountIndex} = useImportHWParams(
    deviceInfo?.name,
  )

  // TODO： take care when add multiple chain
  const base32Address = useMemo(() => {
    if (isUndefined(netId) || isUndefined(addressList)) {
      return []
    }
    return addressList.map(({address}) => encode(address, netId))
  }, [addressList, netId])

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
    base32Address?.length ? base32Address : null,
    networkId,
  )

  const onImportAccount = () => {
    let chosenBase32Address = []
    let accountGroupData = {}
    addressList.forEach(({address, hdPath}, index) => {
      if (checkboxStatusObj?.[address] && !importedAddressData?.[address]) {
        accountGroupData[address] = hdPath
        chosenBase32Address.push({
          address: base32Address[index],
          nickname: `${deviceInfo.name}-${
            nextAccountIndex + chosenBase32Address.length
          }`,
        })
      }
    })

    if ('accountGroupData' in hwParams) {
      accountGroupData = {...accountGroupData, ...hwParams.accountGroupData}
    }
    let params = {...hwParams, accountGroupData, address: chosenBase32Address}
    setImportStatus('loading')
    request(WALLET_IMPORT_HARDWARE_WALLET_ACCOUNT_GROUP_OR_ACCOUNT, params)
      .then(() => {
        setImportStatus('success')
      })
      .catch(err => {
        setImportStatus('')
        // TODO: error msg
        console.log('err', err)
        setErrMsg(err?.message || 'something wrong')
      })
  }

  if (!deviceInfo?.name) {
    return null
  }
  if (importStatus) {
    return <ImportingResults importStatus={importStatus} />
  }
  return (
    <div id="import-hw-account" className="flex flex-col h-full w-full">
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
                      accountIdentity={hexAddress}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-40">
                        {base32Address?.[index]
                          ? shortenAddress(base32Address[index])
                          : ''}
                      </p>
                      <DisplayBalance
                        balance={
                          balances?.[base32Address?.[index]]?.['0x0'] || '0'
                        }
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
            !base32Address?.length ||
            loading ||
            !Object.keys(hwParams).length ||
            Object.keys(checkboxStatusObj).filter(
              addr => checkboxStatusObj[addr] && !importedAddressData[addr],
            ).length === 0
          }
        >
          {t('next')}
        </Button>
      </div>
      {/* TODO: error toast style */}
      <Toast
        content={errMsg}
        open={!!errMsg}
        type="line"
        onClose={() => setErrMsg('')}
      />
    </div>
  )
}
export default ImportHwAccount
