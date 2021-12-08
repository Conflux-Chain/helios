import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {SlideCard, LanguageNav} from '../../../components'
import {LockOutLined} from '@fluent-wallet/component-icons'
import {RPC_METHODS} from '../../../constants'
import {request} from '../../../utils'

const {LOCK} = RPC_METHODS

function SettingItem({icon, content}) {
  return (
    <div className="group mt-2 py-2.5 cursor-pointer text-gray-80 hover:bg-primary-4 hover:text-primary">
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
}

function Setting({onClose, onOpen}) {
  const {t} = useTranslation()
  const onLock = () => {
    // TODO:deal with error
    request(LOCK)
  }

  return (
    <SlideCard
      id="setting"
      onClose={onClose}
      onOpen={onOpen}
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
            startIcon={<LockOutLined className="!text-gray-40 w-3 h-3" />}
            variant="text"
            color="primary"
            className="!bg-bg"
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
  )
}

Setting.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.bool.isRequired,
}

export default Setting
