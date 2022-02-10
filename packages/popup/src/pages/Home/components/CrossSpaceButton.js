import {CrossOutlined} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'
import {WrapIcon} from '../../../components'

function CrossSpaceButton() {
  const {t} = useTranslation()
  return (
    <Tooltip content={t('crossSpace')}>
      <WrapIcon className="!bg-transparent hover:!bg-[#ffffff1a]">
        <CrossOutlined
          className="text-white transition-all duration-100 ease-in-out w-4 h-4 cursor-pointer"
          id="openCrossSpace"
          onClick={() =>
            window.open('https://evm.fluentwallet.com#source=fluent-wallet')
          }
        />
      </WrapIcon>
    </Tooltip>
  )
}

export default CrossSpaceButton
