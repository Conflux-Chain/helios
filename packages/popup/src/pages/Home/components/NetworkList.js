import PropTypes from 'prop-types'
import classNames from 'classnames'
import {useTranslation, Trans} from 'react-i18next'
import {Link} from 'react-router-dom'
import {SlideCard, NetworkContent} from '../../../components'
import {ROUTES} from '../../../constants'
import {usePreferences} from '../../../hooks/useApi'
import {isRunningInSidePanel} from '../../../utils/side-panel'

const {ADVANCED_SETTINGS} = ROUTES

function NetworkList({onClose, open}) {
  const {t} = useTranslation()
  const {data: preferencesData} = usePreferences()

  const onCloseNetwork = () => {
    onClose && onClose()
  }
  return (
    <SlideCard
      id="network-list"
      cardTitle={
        <div className="ml-3 pb-4">
          <p className="text-base text-gray-80 font-medium">{t('network')}</p>
        </div>
      }
      onClose={onClose}
      open={open}
      cardContent={<NetworkContent onClose={onCloseNetwork} />}
      cardFooter={
        <Trans
          i18nKey="switchTestnetDisplay"
          components={{
            Container: (
              <div
                className={classNames('flex w-full justify-center  pt-6', {
                  'pb-[104px]': preferencesData?.hideTestNetwork,
                  'pb-[27px]': !preferencesData?.hideTestNetwork,
                })}
              />
            ),
            SwitchButton: (
              <Link className="text-primary mr-0.5" to={ADVANCED_SETTINGS} />
            ),
          }}
        />
      }
      width={isRunningInSidePanel() ? 'w-full' : undefined}
    />
  )
}

NetworkList.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default NetworkList
