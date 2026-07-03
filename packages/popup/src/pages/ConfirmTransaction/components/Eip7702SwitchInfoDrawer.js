import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {SlideCard} from '../../../components'

const SWITCH_BENEFIT_ITEMS = [
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

function Eip7702SwitchInfoDrawer({open, onClose, title, content, actions}) {
  const {t} = useTranslation()

  const defaultTitle = (
    <div>
      <p className="text-base font-medium text-gray-80">
        {t('eip7702SwitchInfoTitle')}
      </p>
      <p className="mt-2 text-xs font-normal text-gray-40">
        {t('eip7702SwitchInfoDesc')}
      </p>
    </div>
  )

  const defaultContent = (
    <div className="my-4 rounded-lg bg-white p-3">
      <p className="text-sm font-medium text-gray-80">
        {t('eip7702SwitchInfoBenefitsTitle')}
      </p>

      <div className="mt-2 flex flex-col gap-2">
        {SWITCH_BENEFIT_ITEMS.map(({iconSrc, titleKey}) => (
          <div
            key={titleKey}
            className="flex items-center gap-3 rounded bg-gray-4 px-3 py-[10px]"
          >
            <img src={iconSrc} alt="" aria-hidden="true" className="h-5 w-5" />
            <span className="text-sm font-medium text-gray-80">
              {t(titleKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const defaultActions = (
    <div className="px-3">
      <Button fullWidth onClick={onClose}>
        {t('eip7702SwitchInfoConfirm')}
      </Button>
    </div>
  )

  return (
    <SlideCard
      id="eip7702-switch-info"
      containerClassName="absolute inset-0 z-[60]"
      cardClassName="pb-6"
      open={open}
      onClose={onClose}
      height="h-auto"
      showClose={false}
      cardTitle={title || defaultTitle}
      cardContent={content || defaultContent}
      cardFooter={actions || defaultActions}
    />
  )
}

Eip7702SwitchInfoDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  content: PropTypes.node,
  actions: PropTypes.node,
}

export default Eip7702SwitchInfoDrawer
