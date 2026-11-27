import PropTypes from 'prop-types'
import ApproveTransactionHeader from './ApproveTransactionHeader'
import TransferTransactionHeader from './TransferTransactionHeader'
import EIP7702TransactionHeader from './EIP7702TransactionHeader'
import {useTranslation} from 'react-i18next'
import TransactionAssetDetails from '../../../components/TransactionAssetDetails'

function GenericTransactionHeader({tx, sessionId}) {
  const {t} = useTranslation()

  return (
    <div
      className="p-4 pb-6 bg-no-repeat bg-bottom bg-cover rounded-t-[8px] mb-4"
      style={{
        backgroundImage: 'url(/images/signature-request-bg.svg)',
      }}
    >
      <div className="relative flex items-center justify-center gap-1 text-[16px] leading-[18px] font-medium text-primary mb-4">
        <img alt="icon" className="w-3 h-3 mr-1" src="/images/sign-icon.svg" />
        <span>{t('signTransaction')}</span>
      </div>
      <TransactionAssetDetails tx={tx} sessionId={sessionId} />
    </div>
  )
}

GenericTransactionHeader.propTypes = {
  tx: PropTypes.object,
  sessionId: PropTypes.string,
}

const headersByKind = {
  transfer: TransferTransactionHeader,
  delegation: EIP7702TransactionHeader,
  approval: ApproveTransactionHeader,
  generic: GenericTransactionHeader,
}

function TransactionHeader({kind, ...props}) {
  const Header = headersByKind[kind]
  return <Header {...props} />
}

TransactionHeader.propTypes = {
  kind: PropTypes.oneOf(Object.keys(headersByKind)).isRequired,
}

export default TransactionHeader
