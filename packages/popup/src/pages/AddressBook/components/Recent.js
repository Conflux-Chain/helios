import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {shortenAddress} from '@fluent-wallet/shorten-address'

import {useRecentTradingAddress, useCurrentAddress} from '../../../hooks/useApi'
import {useServiceName, useAddressWithServiceName} from '../../../hooks'
import {isValidDomainName, formatNsName} from '../../../utils'
import {NoResult, ContactItem, Avatar} from '../../../components'

function RecentItem({
  address,
  note,
  refreshData,
  onJumpToSendTx,
  recentItemId,
}) {
  const {t} = useTranslation()

  const [addToContact, setAddToContact] = useState(false)

  const {
    data: {
      network: {type, netId},
    },
  } = useCurrentAddress()

  const {data: nsName} = useServiceName({
    type,
    netId,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    address,
  })

  const onAddedContactCallback = async () => {
    setAddToContact(false)
    await refreshData?.()
  }

  const onAddToContact = e => {
    e.stopPropagation()
    setAddToContact(true)
  }
  return (
    <div className="cursor-pointer" id={`recent-tx-${address}`}>
      {note ? (
        <div
          aria-hidden="true"
          id={recentItemId}
          onClick={() => onJumpToSendTx({address, note})}
        >
          <ContactItem
            address={address}
            memo={note}
            memoOverlay={
              <div className="flex items-center">
                {nsName && (
                  <div className="text-[#808BE7]  font-medium mr-1">
                    {formatNsName(nsName)}
                  </div>
                )}
                {note && (
                  <div className="p-1 text-xs text-primary bg-primary-10 text-ellipsis max-w-[108px]">
                    {note}
                  </div>
                )}
              </div>
            }
          />
        </div>
      ) : address && !addToContact ? (
        <div
          className="flex items-center justify-between rounded shadow-fluent-4 px-3 bg-white hover:bg-primary-10 mt-3"
          aria-hidden="true"
          id={recentItemId}
          onClick={() => onJumpToSendTx({address})}
        >
          <div className="flex items-center py-3">
            <Avatar
              className="w-7.5 h-7.5 mr-2"
              diameter={30}
              address={address}
            />
            <div>
              {nsName && (
                <div className="text-[#808BE7]  font-medium">
                  {formatNsName(nsName)}
                </div>
              )}
              <div className="text-gray-40 text-xs">
                {shortenAddress(address)}
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="cursor-pointer text-primary h-full py-3"
            id={`add-contact-${address}`}
            onClick={onAddToContact}
          >
            {t('add')}
          </div>
        </div>
      ) : address && addToContact ? (
        <ContactItem
          address={address}
          memo=""
          onSubmitCallback={onAddedContactCallback}
          onClickAwayCallback={() => setAddToContact(false)}
          id={recentItemId}
        />
      ) : null}
    </div>
  )
}

RecentItem.propTypes = {
  recentItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  address: PropTypes.string,
  note: PropTypes.string,
  refreshData: PropTypes.func,
  onJumpToSendTx: PropTypes.func,
}

function Recent({fuzzy = '', onJumpToSendTx}) {
  const {t} = useTranslation()
  const {
    data: {
      network: {type, netId},
    },
  } = useCurrentAddress()

  const {data} = useAddressWithServiceName({
    type,
    netId,
    provider: window?.___CFXJS_USE_RPC__PRIVIDER,
    name: fuzzy,
    notSend: !isValidDomainName(fuzzy),
  })

  const {data: tradingAddressData, mutate} = useRecentTradingAddress(
    data ? {fuzzy: data} : {fuzzy},
  )

  const [displayTradingAddressData, setDisplayTradingAddressData] =
    useState(undefined)

  useEffect(() => {
    if (tradingAddressData?.data) {
      setDisplayTradingAddressData([...tradingAddressData.data])
    }
  }, [tradingAddressData?.data])

  return (
    <div className="h-full overflow-auto">
      {displayTradingAddressData?.length > 0 &&
        displayTradingAddressData.map(
          ({address, memoValue, accountNickname}, index) => (
            <RecentItem
              address={address}
              note={accountNickname || memoValue}
              key={index}
              recentItemId={index}
              refreshData={mutate}
              onJumpToSendTx={onJumpToSendTx}
            />
          ),
        )}
      {displayTradingAddressData?.length === 0 && (
        <NoResult content={t('noResult')} />
      )}
    </div>
  )
}

Recent.propTypes = {
  fuzzy: PropTypes.string,
  onJumpToSendTx: PropTypes.func,
}
export default Recent
