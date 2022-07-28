import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {shortenAddress} from '@fluent-wallet/shorten-address'

import {useRecentTradingAddress} from '../../../hooks/useApi'
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
          <ContactItem address={address} memo={note} />
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
            <span className="text-gray-40 text-xs">
              {shortenAddress(address)}
            </span>
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
  const {data: tradingAddressData, mutate} = useRecentTradingAddress({fuzzy})

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
