import PropTypes from 'prop-types'
import {DisplayBalance, AddressDisplay} from '../../../components'
import {useTranslation} from 'react-i18next'
import TransactionDirection from './TransactionDirection'

function TransferTransactionHeader({
  token,
  sendAmount,
  fromAddress,
  toAddress,
  nickname,
}) {
  const {t} = useTranslation()
  return (
    <div
      id="addressCardContainer"
      className="address-card-container w-full flex flex-col pt-3 pb-6 px-4 items-center bg-blue-card-linear bg-no-repeat bg-cover mt-1 mb-4"
    >
      <header
        className="address-card-header text-primary flex items-center"
        id="addressCardTitle"
      >
        <img
          alt="icon"
          className="w-3 h-3 mr-1"
          src="/images/send-token-icon.svg"
        />
        {t('sendToken')}
      </header>
      <div className="h-10 mt-1 mb-3 flex items-center" id="sendToken">
        <DisplayBalance
          id="sendAmount"
          balance={sendAmount}
          maxWidth={256}
          maxWidthStyle="max-w-[256px]"
          className="text-2xl"
          initialFontSize={32}
          decimals={0}
        />
        {token && (
          <AddressDisplay
            address={token.address}
            iconUrl={token.logoURI}
            name={token.name}
            symbol={token.symbol}
            kind="token"
            iconClassName="w-4 h-4"
          />
        )}
      </div>
      <TransactionDirection
        fromAddress={fromAddress}
        toAddress={toAddress}
        fromAddressLabel={nickname}
        toAddressLabel={t('toAddress')}
      />
    </div>
  )
}

TransferTransactionHeader.propTypes = {
  token: PropTypes.object,
  sendAmount: PropTypes.string,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  nickname: PropTypes.string,
}

export default TransferTransactionHeader
