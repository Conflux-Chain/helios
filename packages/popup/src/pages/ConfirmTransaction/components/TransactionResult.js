import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {CheckCircleOutlined} from '@fluent-wallet/component-icons'
import Link from '@fluent-wallet/component-link'
import Button from '@fluent-wallet/component-button'
import {CFX_SCAN_DOMAINS, ETH_SCAN_DOMAINS} from '@fluent-wallet/consts'
import {useNetworkTypeIsCfx, useCurrentAddress} from '../../../hooks/useApi'
import useGlobalStore from '../../../stores'
import {ROUTES} from '../../../constants'
const {HOME} = ROUTES

function TransactionResult({transactionHash}) {
  const {t} = useTranslation()
  const {data: curAddr} = useCurrentAddress()

  const netId = curAddr.network?.netId
  const history = useHistory()
  const {clearSendTransactionParams} = useGlobalStore()
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  return (
    <div className="w-full h-full flex flex-col items-center justify-between absolute inset-0 bg-gray-0 pb-4">
      <div className="flex flex-col items-center">
        <CheckCircleOutlined className="w-[88px] h-[88px] mt-[156px] mb-8 text-success" />
        <span className="text-base text-gray-80">{t('transactionSubmit')}</span>
        <Link
          className="mt-2"
          onClick={() =>
            (CFX_SCAN_DOMAINS[netId] || CFX_SCAN_DOMAINS[netId]) &&
            window.open(
              networkTypeIsCfx
                ? `${CFX_SCAN_DOMAINS[netId]}/transaction/${transactionHash}`
                : `${ETH_SCAN_DOMAINS[netId]}/tx/${transactionHash}`,
            )
          }
        >
          {t('viewOnScan')}
        </Link>
      </div>
      <Button
        className="w-70"
        onClick={() => {
          history.push(HOME)
          clearSendTransactionParams()
        }}
      >
        {t('ok')}
      </Button>
    </div>
  )
}

TransactionResult.propTypes = {
  transactionHash: PropTypes.string.isRequired,
}

export default TransactionResult
