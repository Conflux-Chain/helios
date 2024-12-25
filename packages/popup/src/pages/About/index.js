import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {RightOutlined} from '@fluent-wallet/component-icons'
import {useWalletVersion} from '../../hooks/useApi'
import {TitleNav} from '../../components'

const ABOUT_ITEMS = [
  {
    contentKey: 'website',
    iconPath: '/images/computer.svg',
    enLink: 'https://www.fluentwallet.com/',
    zhLink: 'https://www.fluentwallet.com/',
  },
  {
    contentKey: 'feedback',
    iconPath: '/images/chat.svg',
    enLink: 'https://fluent-wallet.zendesk.com/hc/en-001/requests/new',
    zhLink: 'https://fluent-wallet.zendesk.com/hc/zh-cn/requests/new',
  },
  {
    contentKey: 'docs',
    iconPath: '/images/doc.svg',
    enLink: 'https://fluent-wallet.zendesk.com/hc/en',
    zhLink: 'https://fluent-wallet.zendesk.com/hc/zh-cn',
  },
]

function AboutItem({content, icon, jumpPath, ...props}) {
  return (
    <div
      className="flex items-center h-13 mt-2 px-6 cursor-pointer hover:bg-primary-10"
      aria-hidden
      onClick={() => window?.open?.(jumpPath)}
      {...props}
    >
      {icon}
      <span className="ml-4 flex-1 text-gray-80 text-sm">{content}</span>
      <RightOutlined className="text-gray-60 w-4 h-4" />
    </div>
  )
}
AboutItem.propTypes = {
  icon: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  jumpPath: PropTypes.string.isRequired,
}

function About() {
  const {t, i18n} = useTranslation()
  const {view_version} = useWalletVersion()

  return (
    <div id="about" className="bg-gray-0 pb-4 h-full w-full flex flex-col">
      <header>
        <TitleNav />
        <div className="mt-3">
          <div className="w-25 m-auto">
            <div className="h-25 bg-logo-background flex items-center justify-center rounded-[32px]">
              <img src="/images/logo.svg" alt="logo" />
            </div>
            <div className="bg-logo-bottom h-[18px] rounded-[32px] mt-0.5" />
          </div>
          <p className="text-center text-gray-80 font-medium text-lg">
            Fluent Wallet
          </p>
          <p className="text-center text-gray-40 text-sm">{`${t(
            'version',
          )} v${view_version}`}</p>
        </div>
      </header>
      <main className="mt-8">
        {ABOUT_ITEMS.map(({contentKey, iconPath, enLink, zhLink}) => (
          <AboutItem
            key={contentKey}
            id={contentKey}
            icon={<img src={iconPath} alt="link_log" className="w-5 h-5" />}
            jumpPath={i18n.language === 'zh' ? zhLink : enLink}
            content={t(contentKey)}
          />
        ))}
      </main>
    </div>
  )
}

export default About
