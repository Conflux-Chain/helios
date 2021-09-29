import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import {useRPC} from '@fluent-wallet/use-rpc'
import {
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import {RPC_METHODS} from '../../constants'
import {NetworkContent} from '../../components'
const {GET_CURRENT_NETWORK, GET_ACCOUNT_GROUP} = RPC_METHODS

function ConnectSitesList() {
  const {t} = useTranslation()
  const {data: accountGroups} = useRPC([GET_ACCOUNT_GROUP], undefined, {
    fallbackData: [],
  })

  return (
    <>
      <div>
        <div>{t('selectAuthorizedAccounts')}</div>
        <QuestionCircleOutlined onClick={() => window && window.open('')} />
        <Checkbox>{t('selectAll')}</Checkbox>
      </div>
      <div>
        {accountGroups.map(({nickname, account}, index) => (
          <div key={index}>123</div>
        ))}
      </div>
    </>
  )
}

function ConnectSite() {
  const [searchContent, setSearchContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [searchIcon, setSearchIcon] = useState('')
  const {t} = useTranslation()
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])

  const onClickNetworkItem = networkId => {
    console.log(networkId)
    setNetworkShow(false)
  }

  useEffect(() => {
    setSearchIcon(currentNetworkData?.icon || 'images/default-network-icon.svg')
    setSearchContent(currentNetworkData?.name || '')
  }, [Boolean(currentNetworkData)])

  return currentNetworkData ? (
    <>
      <header>
        <p>{t('connectSite')}</p>
        <div>
          <div />
          <div>
            <img src="" alt="favicon" />
          </div>
          <div />
          <img src="images/paperclip.svg" alt="connecting" />
          <div />
          <div>
            <img className="w-6 h-6" src="images/logo.svg" alt="logo" />
          </div>
          <div />
        </div>
        <p>dapp name</p>
      </header>
      <main>
        <p>{t('selectNetwork')}</p>
        <div
          aria-hidden
          onClick={() => setNetworkShow(true)}
          className="cursor-pointer"
        >
          <Input
            value={searchContent}
            width="w-full box-border"
            readOnly={true}
            className="pointer-events-none"
            suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
            prefix={
              <img src={searchIcon} alt="network icon" className="w-4 h-4" />
            }
          />
        </div>
        <ConnectSitesList />
        <Modal
          open={networkShow}
          size="small"
          onClose={() => setNetworkShow(false)}
          content={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
        />
      </main>
      <footer></footer>
    </>
  ) : null
}

export default ConnectSite
