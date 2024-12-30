import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {useSWRConfig} from 'swr'
import Button from '@fluent-wallet/component-button'
import {SlideCard, LanguageNav} from '../../../components'
import {LockOutLined, SidePanelSwitch} from '@fluent-wallet/component-icons'
import {RPC_METHODS, ROUTES} from '../../../constants'
import {useDataForPopup, useSidePanel} from '../../../hooks/useApi'
import {request} from '../../../utils'
import useGlobalStore from '../../../stores'
import {toggleSidePanelMode} from '../../../utils/side-panel'

const {LOCK, WALLET_METADATA_FOR_POPUP} = RPC_METHODS
const {
  ACCOUNT_MANAGEMENT,
  NETWORK_MANAGEMENT,
  ABOUT,
  AUTHORIZED_WEBSITE,
  ADVANCED_SETTINGS,
} = ROUTES

const SETTING_ITEMS = [
  {
    contentKey: 'accountManagement',
    iconPath: '/images/userGroup.svg',
    jumpPath: ACCOUNT_MANAGEMENT,
  },
  {
    contentKey: 'networkManagement',
    iconPath: '/images/chart.svg',
    jumpPath: NETWORK_MANAGEMENT,
  },
  {
    contentKey: 'authorizedWebsite',
    iconPath: '/images/safety.svg',
    jumpPath: AUTHORIZED_WEBSITE,
  },
  {
    contentKey: 'AdvancedSettings',
    iconPath: '/images/advanced-settings.svg',
    jumpPath: ADVANCED_SETTINGS,
  },
  {
    contentKey: 'about',
    iconPath: '/images/exclamation-circle.svg',
    jumpPath: ABOUT,
  },
]

function SettingItem({icon, content, onClick}) {
  return (
    <div
      aria-hidden
      className="group mt-2 py-2.5 cursor-pointer text-gray-80 hover:bg-primary-10 hover:text-primary"
      onClick={() => {
        onClick && onClick()
      }}
    >
      <div className="flex items-center border-solid border-transparent border-l-4 group-hover:border-primary pl-6 h-8">
        {icon}
        <span className="ml-4 text-sm">{content}</span>
      </div>
    </div>
  )
}

SettingItem.propTypes = {
  icon: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

function Setting({onClose, open, settingAnimate = true}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {setFatalError} = useGlobalStore()
  const {mutate} = useSWRConfig()
  const data = useDataForPopup()
  const {enabled: sidePanelEnabled, isSupported: isSidePanelSupported} =
    useSidePanel()
  const onLock = () => {
    request(LOCK)
      .then(() => {
        mutate([WALLET_METADATA_FOR_POPUP], {...data, locked: true}, false)
      })
      .catch(error => setFatalError(error))
  }

  const onClickSettingItem = jumpPath => {
    history.push('?open=setting-page')
    history.push(jumpPath)
  }

  const onSwitchSidePanel = () => {
    toggleSidePanelMode(!sidePanelEnabled)
  }

  return (
    <div>
      <SlideCard
        id="setting"
        onClose={onClose}
        open={open}
        showClose={false}
        needAnimation={settingAnimate}
        cardTitle={
          <LanguageNav
            hasGoBack={true}
            showLan={false}
            color="text-black"
            onClickBack={onClose}
          />
        }
        cardContent={
          <div className="pt-1 pb-4 flex-1">
            {SETTING_ITEMS.map(({contentKey, iconPath, jumpPath}) => (
              <SettingItem
                key={contentKey}
                onClick={() => onClickSettingItem(jumpPath)}
                icon={
                  <img
                    src={iconPath}
                    alt="icon"
                    className="w-5 h-5"
                    id={contentKey}
                  />
                }
                content={t(contentKey)}
              />
            ))}
          </div>
        }
        cardFooter={
          <div className="px-6 pb-4 flex items-center justify-between">
            <Button
              size="medium"
              fullWidth
              startIcon={
                <LockOutLined className="!text-gray-40 !w-[0.75rem] !h-[0.75rem] group-hover:!text-primary" />
              }
              variant="text"
              color="primary"
              className="!bg-bg hover:!bg-primary-10 hover:text-primary group max-w-[8rem]"
              id="lockBtn"
              onClick={onLock}
            >
              {t('lock')}
            </Button>
            {isSidePanelSupported && (
              <Button
                size="medium"
                fullWidth
                startIcon={
                  <SidePanelSwitch className="!text-gray-40 !w-[0.75rem] !h-[0.75rem] group-hover:!text-primary" />
                }
                variant="text"
                color="primary"
                className="!bg-bg hover:!bg-primary-10 hover:text-primary group max-w-[8.75rem]"
                id="sidePanelBtn"
                onClick={onSwitchSidePanel}
              >
                {sidePanelEnabled ? t('closeSidePanel') : t('openSidePanel')}
              </Button>
            )}
          </div>
        }
        direction="horizontal"
        width="w-85"
        height="h-full"
        cardClassName="!rounded-t-none !p-0 flex flex-col"
        containerClassName="pl-8"
        backgroundColor="bg-gray-0"
      />
    </div>
  )
}

Setting.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  settingAnimate: PropTypes.bool,
}

export default Setting
