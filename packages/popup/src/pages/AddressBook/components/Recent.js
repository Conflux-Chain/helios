import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {isHexAddress} from '@fluent-wallet/account'
import {decode} from '@fluent-wallet/base32-address'
import {shortenAddress} from '@fluent-wallet/shorten-address'

import {useRecentTradingAddress} from '../../../hooks/useApi'
import {NoResult, ContactItem, Avatar} from '../../../components'

function RecentItem({address, memo, refreshData, onJumpToSendTx}) {
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
    <div
      aria-hidden="true"
      onClick={() => onJumpToSendTx(address)}
      className="cursor-pointer"
      id={address}
    >
      {memo ? (
        <ContactItem address={address} memo={memo} />
      ) : address && !addToContact ? (
        <div className="flex">
          <Avatar
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-0 mr-2"
            diameter={30}
            accountIdentity={
              address && !isHexAddress(address) ? decode(address) : address
            }
          />
          <span>{shortenAddress(address)}</span>
          <span
            aria-hidden="true"
            className="cursor-pointer"
            id={`add-contact-${address}`}
            onClick={onAddToContact}
          >
            {t('add')}
          </span>
        </div>
      ) : address && addToContact ? (
        <ContactItem
          address={address}
          memo=""
          onSubmitCallback={onAddedContactCallback}
          onClickAwayCallback={() => setAddToContact(false)}
        />
      ) : null}
    </div>
  )
}

RecentItem.propTypes = {
  address: PropTypes.string,
  memo: PropTypes.string,
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
    <div>
      {displayTradingAddressData?.length > 0 &&
        displayTradingAddressData.map(({address, memoValue}) => (
          <RecentItem
            address={address}
            memo={memoValue}
            key={address}
            refreshData={mutate}
            onJumpToSendTx={onJumpToSendTx}
          />
        ))}
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
