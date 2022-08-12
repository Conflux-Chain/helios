import PropTypes from 'prop-types'
import {CrossOutlined} from '@fluent-wallet/component-icons'
import Tooltip from '@fluent-wallet/component-tooltip'
import {useTranslation} from 'react-i18next'
import {WrapIcon} from '../../../components'

function CrossSpaceButton({type}) {
  const {t} = useTranslation()

  return (
    <Tooltip content={t('crossSpace')}>
      <WrapIcon className="!bg-transparent hover:!bg-[#ffffff1a]">
        <CrossOutlined
          className="text-white transition-all duration-100 ease-in-out w-4 h-4 cursor-pointer"
          id="openCrossSpace"
          onClick={() => {
            if (type === 'mainnet') {
              window.open(
                'https://confluxhub.io/espace-bridge/cross-space#source=fluent-wallet',
              )
            } else if (type === 'testnet') {
              window.open(
                'https://test.confluxhub.io/espace-bridge/cross-space#source=fluent-wallet',
              )
            }
          }}
        />
      </WrapIcon>
    </Tooltip>
  )
}

CrossSpaceButton.propTypes = {
  type: PropTypes.string,
}

export default CrossSpaceButton
