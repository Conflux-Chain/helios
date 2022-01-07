import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router-dom'
import {useSWRConfig} from 'swr'
import Button from '@fluent-wallet/component-button'
import {SlideCard, LanguageNav} from '../../../components'
import {LockOutLined} from '@fluent-wallet/component-icons'
import {RPC_METHODS, ROUTES} from '../../../constants'
import {request} from '../../../utils'
import useGlobalStore from '../../../stores/index.js'

const {LOCK, WALLET_METADATA_FOR_POPUP} = RPC_METHODS
const {ACCOUNT_MANAGEMENT} = ROUTES

function SettingItem({icon, content, onClick}) {
  return (
    <div
      aria-hidden
      className="group mt-2 py-2.5 cursor-pointer text-gray-80 hover:bg-primary-4 hover:text-primary"
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

function Setting({onClose, open}) {
  const {t} = useTranslation()
  const navigate = useNavigate()
  const {setFatalError} = useGlobalStore()
  const {mutate} = useSWRConfig()
  const onLock = () => {
    request(LOCK)
      .then(() => {
        mutate([WALLET_METADATA_FOR_POPUP])
      })
      .catch(error => setFatalError(error))
  }

  return (
    <div>
      <SlideCard
        id="setting"
        onClose={onClose}
        open={open}
        showClose={false}
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
            <SettingItem
              onClick={() => navigate(ACCOUNT_MANAGEMENT)}
              icon={
                <img src="/images/account.svg" alt="icon" className="w-5 h-5" />
              }
              content={t('accountManagement')}
            />
          </div>
        }
        cardFooter={
          <div className="px-6 pb-4">
            <Button
              size="medium"
              fullWidth
              startIcon={
                <LockOutLined className="!text-gray-40 w-3 h-3 group-hover:!text-primary" />
              }
              variant="text"
              color="primary"
              className="!bg-bg hover:!bg-primary-10 hover:text-primary group"
              id="lockBtn"
              onClick={onLock}
            >
              {t('lock')}
            </Button>
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
}

export default Setting
