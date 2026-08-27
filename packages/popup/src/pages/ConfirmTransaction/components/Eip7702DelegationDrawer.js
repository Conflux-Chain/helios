import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {SlideCard} from '../../../components'

const BENEFIT_ITEMS = [
  {
    iconSrc: '/images/7702FlexibleGas.svg',
    titleKey: 'eip7702FlexibleGasTitle',
  },
  {
    iconSrc: '/images/7702BatchTransactions.svg',
    titleKey: 'eip7702BatchTransactionsTitle',
  },
  {
    iconSrc: '/images/7702DappSupport.svg',
    titleKey: 'eip7702DappSupportTitle',
  },
]

function Eip7702DelegationDrawer({
  id,
  title,
  description,
  confirmText,
  open,
  onConfirm,
  onClose,
  showClose = false,
}) {
  const {t} = useTranslation()

  return (
    <SlideCard
      id={id}
      containerClassName="absolute inset-0 z-[60]"
      cardClassName="pb-6"
      open={open}
      onClose={onClose}
      height="h-auto"
      showClose={showClose}
      cardTitle={
        <div>
          <p className="text-base font-medium text-gray-80">{title}</p>
          <p className="mt-2 text-xs font-normal text-gray-40">{description}</p>
        </div>
      }
      cardContent={
        <div className="my-4 rounded-lg bg-white p-3">
          <p className="text-sm font-medium text-gray-80">
            {t('eip7702SwitchInfoBenefitsTitle')}
          </p>

          <div className="mt-2 flex flex-col gap-2">
            {BENEFIT_ITEMS.map(({iconSrc, titleKey}) => (
              <div
                key={titleKey}
                className="flex items-center gap-3 rounded bg-gray-4 px-3 py-[10px]"
              >
                <img
                  src={iconSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-80">
                  {t(titleKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
      cardFooter={
        <div className="px-3">
          <Button fullWidth onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    />
  )
}

Eip7702DelegationDrawer.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  confirmText: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  showClose: PropTypes.bool,
}

export default Eip7702DelegationDrawer
